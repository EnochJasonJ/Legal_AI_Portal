from django.shortcuts import render
from django.http import HttpResponse
# from rest_framework.decorators import APIView
from rest_framework.views import APIView
from .serializers import RegistrationSerializer, LoginSerializer, UploadedDocumentSerializer, CitationSerializer
from rest_framework.authtoken.models import Token
from rest_framework import response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from .models import UploadedDocument , Citation
import spacy
from sentence_transformers import SentenceTransformer, util
from google import genai
import pdfplumber
import json
import docx
import requests
from datetime import datetime
import os
from dotenv import load_dotenv
import re

load_dotenv()


client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Create your views here.

def hello(request):
    return HttpResponse('Hello World')

class RegisterView(APIView):
    def post(self,request):
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token , _ = Token.objects.get_or_create(user=user)
            return response.Response({'token': token.key},status=status.HTTP_201_CREATED)
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self,request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            token, _ = Token.objects.get_or_create(user=user)
            return response.Response({"token": token.key} )
        return response.Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
class DocumentUploadView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]
    def post(self,request):
        file_obj = request.FILES['file']
        doc = UploadedDocument.objects.create(user=request.user,file=file_obj)
        return response.Response({'message':'File Uploaded','doc_id':doc.id})

nlp = spacy.load("en_core_web_sm")

def extract_citations(text):
    doc = nlp(text)
    citations = []
    for ent in doc.ents:
        if ent.label_ in ["LAW","CASE"]:
            citations.append({
                "raw_text": ent.text,
                "start": ent.start_char,
                "end": ent.end_char
            })
    return citations

model = SentenceTransformer('all-MiniLM-L6-v2')

def detect_citation_type(citation):
    if "U.S.C." in citation:
        return "statute"
    elif "v." in citation:
        return "case"
    else:
        return "unknown"

# def summarize_with_mistral(prompt):
#     try:
#         response = requests.post(
#             "http://localhost:11434/api/generate",
#             json={"model":"mistral","prompt":prompt},
#             timeout=30,
#             stream=True
#         )
#         response.raise_for_status()
#         output = ""
#         print("Raw Mistral output:", response.text)
#         for line in response.iter_lines():
#             if line:
#                 # data = line.decode("utf-8")
#                 # if '"response":"' in data:
#                 #     chunk = data.split('"response:"')[1].split('""')[0]
#                 #     output += chunk
#                 try:
#                     data = json.loads(line.decode("utf-8"))
#                     output += data.get("response", "")
#                 except json.JSONDecodeError:
#                     continue
#         print(f"Summary: {output.strip()} ")
#         return output.strip()
#     except Exception as e:
#         print("Mistral Error: ",e)
#         return "Summary unavailable due to LLM error."

def summarize_with_mistral(prompt):
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={"model":"mistral","prompt":prompt},
            stream=True,  # <-- stream properly
            timeout=30
        )
        response.raise_for_status()
        output = ""
        for line in response.iter_lines():
            if line:
                try:
                    data = json.loads(line.decode("utf-8"))
                    output += data.get("response", "")
                except json.JSONDecodeError:
                    continue
        return output.strip()
    except Exception as e:
        print("Mistral Error:", e)
        return "Summary unavailable due to LLM error."


def verify_citation(context,case_summary):
    context_embedding = model.encode(context, convert_to_tensor=True)
    summary_embedding = model.encode(case_summary,convert_to_tensor=True)
    similarity = util.pytorch_cos_sim(context_embedding,summary_embedding)
    return float(similarity[0][0])

def build_prompt(citation, context):
    citation_type = detect_citation_type(citation)
    if citation_type == "statute":
        return f"Explain the statute {citation} in plain English. Context: {context}"
    else:
        return f"Summarize the legal case {citation} in 2-3 sentences. Context: {context}"

# def summarize_case(text):
#     prompt = f"Summarize this legal case in 2-3 sentences: \n{text}"
#     response = client.models.generate_content(
#     model="gemini-2.5-flash",
#     contents=prompt
#     )
#     return response.text

def summarize_case(citation_text, case_data=None):
    if case_data and case_data.get("summary"):
        base_text = case_data["summary"]
    else:
        base_text = f"The case {citation_text} is a well-known legal decision. Summarize its importance."
    prompt = f"Summarize this legal case in 2-3 sentences:\n{base_text}"
    return summarize_with_mistral(prompt)
    
def citation_score(format_valid,semantic_score,case_year):
    score=0
    if format_valid:
        score += 30
    score += int(semantic_score * 50)
    if case_year and case_year < 2000:
        score -= 10
    return max(0,min(score,100))

url = "https://www.courtlistener.com/api/rest/v4/"

def get_case_from_courtlistener(citation_text):
    url = "https://www.courtlistener.com/api/rest/v4/search/"
    params = {
        "q":citation_text,
        "type":"opinion"
    }
    try:
        response = requests.get(url,params=params,timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("results"):
                case = data["results"][0]
                filed_date = case.get("dateFiled", None)
                year=None
                if filed_date:
                    try:
                        year = datetime.strptime(filed_date,"%Y-%m-%d").year
                    except:
                        year = None
                return {
                    "case_name": case.get("caseName",""),
                    "court": case.get("court",""),
                    "date": case.get("dateFiled",""),
                    "year":year,
                    "summary": case.get("snippet",""),
                    "url": case.get("absolute_url",""),
                }
        return None
    except Exception:
        return None
    


def extract_citations_regex(text):
    case_pattern = r"\b[A-Z][A-Za-z.& ]+ v\. [A-Z][A-Za-z.& ]+, \d+ U\.S\. \d+ \(\d{4}\)"
    statute_pattern = r"\d+\sU\.S\.C\.\s§\s\d+[a-zA-Z0-9()]*"


    matches = re.findall(case_pattern, text) + re.findall(statute_pattern, text)

    return [
        {
            "raw_text": match,
            "start": text.find(match),
            "end": text.find(match) + len(match)
        }
        for match in matches
    ]

class CitationProcessView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self,request):
        doc_id = request.data.get('doc_id')
        try:
            document = UploadedDocument.objects.get(id=doc_id,user=request.user)
        except UploadedDocument.DoesNotExist as e:
            return response.Response({'error':'Document does not exist '},status=404)
        
        file_path = document.file.path
        if file_path.endswith('.pdf'):
            with pdfplumber.open(file_path) as pdf:
                text = "\n".join(page.extract_text()  for page in pdf.pages if page.extract_text())
        elif file_path.endswith('.docx'):
            docx_file = docx.Document(file_path)
            text = "\n".join([para.text for para in docx_file.paragraphs])
        elif file_path.endswith('.txt'):
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
        else:
            return response.Response({'error':'Unsupported file type'},status=400)
        print("Extracted text:", text[:500])  # Preview first 500 characters
        citations = extract_citations(text) + extract_citations_regex(text)
        results = []
        
        for citation in citations:
            context = text[citation['start']:citation['end']+200]
            case_data = get_case_from_courtlistener(citation['raw_text'])
            if case_data:
                case_summary = case_data["summary"]
                year = case_data["year"] if case_data["year"] else 2005
            else:
                case_summary = "No case summary found in CourtListener"
                year = 2005
            semantic_score = verify_citation(context,case_summary)
            summary = summarize_case(citation['raw_text'], case_data)
            score = citation_score(True,semantic_score,year)
            
            citation_obj = Citation.objects.create(
                document=document,
                raw_text=citation['raw_text'],
                case_name=case_data["case_name"] if case_data else "",
                court=case_data["court"] if case_data else "",
                date=case_data["date"] if case_data else "",
                summary=summary,
                semantic_score=semantic_score,
                trust_score=score,
                source_url=case_data["url"] if case_data else ""
            )
            
            results.append({
                "citation": citation_obj.raw_text,
                "case_name": citation_obj.case_name,
                "court": citation_obj.court,
                "date": citation_obj.date,
                "summary": citation_obj.summary,
                "semantic_summary": citation_obj.semantic_score,
                "trust_score": citation_obj.trust_score,
                "source_url": citation_obj.source_url
            })
        print("Extracted citations:", extract_citations_regex(text))
        return response.Response({"results": results})
    


    


class CitationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self,request, doc_id):
        citations = Citation.objects.filter(document__id = doc_id,document__user=request.user)
        serializer = CitationSerializer(citations,many=True)
        return response.Response(serializer.data)
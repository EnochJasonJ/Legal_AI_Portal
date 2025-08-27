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
import ollama
from rest_framework.generics import ListAPIView

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
        response = ollama.chat(model="mistral",messages=[{"role":"user","content":prompt}])
        return response["message"]["content"].strip()
    except Exception as e:
        print("Mistral Error:", e)
        return "Summary unavailable due to LLM error."
# def summarize_with_mistral(prompt):
#     try:
#         response = requests.post(
#             "http://localhost:11434/api/generate",
#             json={"model":"mistral","prompt":prompt},
#             stream=True,  # <-- stream properly
#             timeout=30
#         )
#         response.raise_for_status()
#         output = ""
#         for line in response.iter_lines():
#             if line:
#                 try:
#                     data = json.loads(line.decode("utf-8"))
#                     output += data.get("response", "")
#                 except json.JSONDecodeError:
#                     continue
#         return output.strip()
#     except Exception as e:
#         print("Mistral Error:", e)
#         return "Summary unavailable due to LLM error."


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

# def summarize_case(citation_text, case_data=None):
#     if case_data and case_data.get("plain_text"):
#         base_text = case_data["plain_text"]
#     else:
#         base_text = f"The case {citation_text} is a well-known legal decision. Summarize its importance."
#     prompt = f"Summarize this legal case in 2-3 sentences:\n{base_text}"
#     return summarize_with_mistral(prompt)

# Replace your old summarize_case function with this one

def summarize_case(citation_text, case_data=None):
    if case_data and case_data.get("plain_text"):
        base_text = case_data["plain_text"][:1000]
        prompt = f"Summarize the following legal text in 2-3 sentences:\n\n{base_text}"
    elif case_data and case_data.get("summary"):
        base_text = case_data["summary"]
        prompt = f"Summarize this legal case in 2-3 sentences:\n{base_text}"
    else:
        base_text = f"The case {citation_text} is a well-known legal decision."
        prompt = f"Summarize the importance of the legal case {citation_text} in 2-3 sentences."
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

# def get_case_from_courtlistener(citation_text):
#     search_url = "https://www.courtlistener.com/api/rest/v4/search/"
#     params = {
#         "q": citation_text,
#         # "type": "opinion"
#         "citation": citation_text
#     }
#     try:
#         print(f"🔎 Searching CourtListener for: {citation_text}") 
#         response = requests.get(search_url, params=params, timeout=10)
#         print(f"Status code: {response.status_code}")
#         if response.status_code == 200:
#             data = response.json()
#             print("CourtListener response:", data)
#             if data.get("results"):
#                 case = data["results"][0]

#                 # Try to resolve court info
#                 # court_name = "Unknown"
#                 court_name = case.get("court", {}).get("name", "Unknown") if isinstance(case.get("court"), dict) else "Unknown"
#                 court_obj = case.get("court")
#                 # if isinstance(court_obj, dict):  # sometimes returned directly
#                 #     court_name = court_obj.get("name", "Unknown")
#                 # elif isinstance(court_obj, str) and court_obj.startswith("http"):
#                 #     # Fetch from court API
#                 #     try:
#                 #         court_resp = requests.get(court_obj, timeout=5)
#                 #         if court_resp.status_code == 200:
#                 #             court_json = court_resp.json()
#                 #             court_name = court_json.get("full_name", court_json.get("short_name", "Unknown"))
#                 #     except Exception as e:
#                 #         print("Court lookup failed:", e)
#                 print(f"Court: {court_name}")
#                 print(f"Court: {court_obj}")
#                 filed_date = case.get("dateFiled")
#                 year = None
#                 if filed_date:
#                     try:
#                         year = datetime.strptime(filed_date, "%Y-%m-%d").year
#                     except:
#                         year = None

#                 return {
#                     "case_name": case.get("caseName", ""),
#                     "court": court_name,
#                     "date": filed_date or "",
#                     "year": year,
#                     "summary": case.get("snippet", ""),
#                     "url": case.get("absolute_url", ""),
#                 }
#         else:
#             print("❌ CourtListener request failed:", response.text)
#         return None
#     except Exception as e:
#         print("CourtListener error:", e)
#         return None

def get_case_from_courtlistener(citation_text):
    """
    Finds a legal document using the fast /search/ endpoint with an intelligent query
    that includes the year to ensure relevance and prevent timeouts.
    """
    api_url = "https://www.courtlistener.com/api/rest/v4/search/"
    params = {}
    
    # --- START: NEW SMART QUERY LOGIC ---
    # Try to find a standard case citation and its year
    case_match = re.search(r'(\d+\s+U\.S\.\s+\d+)\s*\((\d{4})\)', citation_text)
    # Try to find a statute
    statute_match = re.search(r'(\d+\s+U\.S\.C\.\s+§?\s*\d+)', citation_text)

    if case_match:
        reporter_citation = case_match.group(1)
        year = case_match.group(2)
        # Build a highly specific query using quotes for the exact citation and the year
        params['q'] = f'"{reporter_citation}" AND {year}'
        params['type'] = 'o' # We are looking for an opinion
        print(f"✅ Building smart query for case: {params['q']}")
    
    elif statute_match:
        search_query = statute_match.group(1)
        params['q'] = search_query
        print(f"✅ Building query for statute: {params['q']}")
    
    else:
        # Fallback for citations that don't match the standard patterns
        params['q'] = f'"{citation_text}"'
        print(f"⚠️ Using fallback full-text query for: {params['q']}")
    # --- END: NEW SMART QUERY LOGIC ---
    
    api_key = "3021a592b10c096b505aa89a914f10a39415778b"
    # api_key = os.getenv("COURTLISTENER_API_KEY")
    headers = {}
    if api_key:
        headers["Authorization"] = f"Token {api_key}"
        print("🔑 Using CourtListener API Key.")
    else:
        print("⚠️ CourtListener API Key not found. Making unauthenticated request.")
    
    try:
        # We increase the timeout slightly as a precaution, but the better query is the real fix.
        print(f"🔎 Querying CourtListener with params: {params}")
        response = requests.get(api_url, params=params, headers=headers, timeout=15)
        response.raise_for_status()
        data = response.json()
        
        print(f"CourtListener response contains {data.get('count', 0)} results.")

        if data.get("results"):
            case = data["results"][0]
            # ... The rest of the function remains the same ...
            court_obj = case.get("court")
            court_name = "Unknown"
            if isinstance(court_obj, str):
                if court_obj.startswith("http"):
                    try:
                        court_resp = requests.get(court_obj, headers=headers, timeout=5)
                        if court_resp.status_code == 200:
                            court_json = court_resp.json()
                            court_name = court_json.get("full_name", court_json.get("short_name", "Unknown"))
                        else:
                             court_name = court_obj.strip('/').split('/')[-1].upper()
                    except Exception:
                        court_name = court_obj.strip('/').split('/')[-1].upper()
                else:
                    court_name = court_obj.upper()
            elif isinstance(court_obj, dict):
                court_name = court_obj.get("name", "Unknown")
            filed_date_str = case.get("dateFiled")
            year = None
            if filed_date_str:
                try:
                    year = datetime.strptime(filed_date_str, "%Y-%m-%d").year
                except ValueError:
                    year = None
            case_name = case.get("caseName", "N/A")
            if not case_name or case_name == "N/A":
                 case_name = citation_text.split(',')[0]
            return {
                "case_name": case_name,
                "court": court_name,
                "date": filed_date_str or "N/A",
                "year": year,
                "summary": case.get("snippet", ""),
                "plain_text": case.get("plain_text", ""),
                "url": case.get("absolute_url", ""),
            }
        else:
            print(f"❌ No results found on CourtListener for query: {params.get('q')}")
            return None
    except requests.exceptions.Timeout:
        print(f"❌ CourtListener request timed out after 15 seconds. The server may be under heavy load.")
        return None
    except requests.exceptions.HTTPError as e:
        print(f"❌ CourtListener request failed. Status: {e.response.status_code}, Response: {e.response.text}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"❌ CourtListener request failed. Error: {e}")
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
            
            # citation_obj = Citation.objects.create(
            #     document=document,
            #     raw_text=citation['raw_text'],
            #     case_name=case_data["case_name"] if case_data else "",
            #     court=case_data["court"] if case_data else "",
            #     date=case_data["date"] if case_data else "",
            #     summary=summary,
            #     semantic_score=semantic_score,
            #     trust_score=score,
            #     source_url=case_data["url"] if case_data else ""
            # )
            
            citation_obj = Citation.objects.create(
            document=document,
            raw_text=citation['raw_text'],
            case_name=case_data["case_name"] if case_data else citation['raw_text'],
            court=case_data["court"] if case_data else "Unknown",
            date=case_data["date"] if case_data else "Unknown",
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
    
class FetchCitations(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CitationSerializer
    
    def get_queryset(self):
        user = self.request.user
        return Citation.objects.filter(document__user=user)
    
class VoiceAssistView(APIView):
    def post(self,request):
        user_text = request.data.get('text',"")
        citations = request.data.get('context', [])
        if not user_text:
            return response.Response({'error':'No text provided'},status=status.HTTP_400_BAD_REQUEST)
        citations_text = "\n".join([
            f"{c.get('case_name','Unknown Case')}: {c.get('summary','No Summary')}" 
            for c in citations
        ])

        prompt = (
            f"You are a legal assistant. "
            f"Answer the following question based on the provided citations. "
            f"Citations:\n{citations_text}\n\n"
            f"User asked: {user_text}\n"
            "Respond briefly, accurately, and helpfully."
        )
        try:
            answer = summarize_with_mistral(prompt)
        except Exception as e:
            print("VoiceAssist LLM error:", e)
            answer = "Sorry, I am unable to process your request at the moment."
        print(f"VoiceAssist received User text: {user_text}, Citation: {citations_text}")
        print("VoiceAssist answer:", answer)
        return response.Response({'answer':answer})
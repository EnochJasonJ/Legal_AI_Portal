from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class UploadedDocument(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    file= models.FileField(upload_to='uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.file.name
    

class VerificationReport(models.Model):
    document = models.OneToOneField(UploadedDocument,on_delete=models.CASCADE)
    result_json = models.JSONField()
    verified_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Report for {self.document.file.name}"
    
class Citation(models.Model):
    document = models.ForeignKey(UploadedDocument,on_delete=models.CASCADE)
    raw_text = models.TextField()
    report = models.ForeignKey(VerificationReport, on_delete=models.CASCADE,null=True,blank=True)
    case_name = models.CharField(max_length=255, blank=True)
    court = models.CharField(max_length=255, blank=True)
    date = models.CharField(max_length=50, blank=True)
    summary = models.TextField(blank=True)
    semantic_score = models.FloatField()
    trust_score = models.IntegerField()
    source_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.raw_text[:40]}... | Score: {self.trust_score}"
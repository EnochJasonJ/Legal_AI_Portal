from django.contrib import admin
from .models import UploadedDocument, Citation, VerificationReport
# Register your models here.
admin.site.register(UploadedDocument)
admin.site.register(Citation)
admin.site.register(VerificationReport)
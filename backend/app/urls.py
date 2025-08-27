from django.urls import path
from . import views
from .views import RegisterView, LoginView, DocumentUploadView,CitationView, CitationProcessView, FetchCitations , VoiceAssistView
from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [
    path('',views.hello),
    path('register/',RegisterView.as_view(),name='register'),
    path('login/',LoginView.as_view(),name='login'),
    path('upload/',DocumentUploadView.as_view(),name='upload'),
    path('citations/<int:doc_id>/',CitationView.as_view(),name='citation-list'),
    path('citation-process/', CitationProcessView.as_view(), name='citation-process'),
    path('fetch-citations/', FetchCitations.as_view(), name='fetch-citations'),
    path("voice-assist/", VoiceAssistView.as_view(), name="voice-assist"),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
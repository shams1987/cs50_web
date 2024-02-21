from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("createListing", views.createListing, name="createListing"),
    path("categoryListing", views.categoryListing, name="categoryListing"),
    path("listing/<int:id>", views.listing, name="listing"),
    path("deleteWatch/<int:id>", views.deleteWatch, name="deleteWatch"),
    path("addWatch/<int:id>", views.addWatch, name="addWatch"),
    path("displayWatch", views.displayWatch, name="displayWatch"),
    path("addComment/<int:id>", views.addComment, name="addComment"),
    path("addBid/<int:id>", views.addBid, name="addBid"),
    path("closeAuction/<int:id>", views.closeAuction, name="closeAuction"),
    
]

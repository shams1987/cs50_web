from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from .models import User, Category, Listing, Comment, Bid


def index(request):
    allCategories = Category.objects.all()
    activeListings = Listing.objects.filter(isActive=True)
    return render(request, "auctions/index.html", {
        "categories": allCategories,
        "activeListings" : activeListings
    })


def createListing(request):
    if request.method == "GET":
        allCategories = Category.objects.all()
        return render(request, "auctions/createListing.html", {
            "categories": allCategories
        })
    else:
        # get data from the form
        title = request.POST["title"]
        description = request.POST["description"]
        imageUrl = request.POST["imageUrl"]
        price = request.POST["price"]
        category = request.POST["category"]

        # get user
        currentUser = request.user

        categoryData = Category.objects.get(categoryName=category)
        # bid object
        bid = Bid(bid=int(price), user=currentUser)
        bid.save()
        # create new listing
        newListing = Listing(
            title = title,
            description = description,
            imageUrl = imageUrl,
            price = bid,
            category = categoryData,
            owner = currentUser
        )

        newListing.save()
        return HttpResponseRedirect(reverse(index))


# for viewing listings on a particular category
def categoryListing(request):
    if request.method == "POST":
        categoryForm = request.POST['category']
        category = Category.objects.get(categoryName=categoryForm)
        activeListings = Listing.objects.filter(isActive=True, category=category)
        allCategories = Category.objects.all()
        return render(request, "auctions/index.html", {
            "categories": allCategories,
            "activeListings" : activeListings
        })

# specific page for a listing with all details
def listing(request, id):
    listingData = Listing.objects.get(pk=id)
    listingInWatch = request.user in listingData.watchlist.all()
    allComments = Comment.objects.filter(listing=listingData)
    isOwner = request.user.username == listingData.owner.username
    
    return render(request, "auctions/listing.html", {
        "listing": listingData,
        "listingInWatch": listingInWatch,
        "allComments": allComments,
        "isOwner": isOwner,
    })
    
def deleteWatch(request, id):
    listingData = Listing.objects.get(pk=id)
    currentUser = request.user
    listingData.watchlist.remove(currentUser)
    return HttpResponseRedirect(reverse("listing", args=(id, )))


def addWatch(request, id):
    listingData = Listing.objects.get(pk=id)
    currentUser = request.user
    listingData.watchlist.add(currentUser)
    return HttpResponseRedirect(reverse("listing", args=(id, )))

def displayWatch(request):
    currentUser = request.user
    watchListings = currentUser.listingWatchList.all()
    return render(request, "auctions/displayWatch.html", {
        "watchListings": watchListings,
    })

def addComment(request, id):
    currentUser = request.user
    listingData = Listing.objects.get(pk = id)
    message = request.POST['addComment']
    
    newComment = Comment(
        author = currentUser,
        listing = listingData,
        message = message
    )
    
    newComment.save()
    
    return HttpResponseRedirect(reverse("listing", args=(id, )))

def addBid(request, id):
    newBid = request.POST['addBid']
    listingData = Listing.objects.get(pk=id)
    listingInWatch = request.user in listingData.watchlist.all()
    allComments = Comment.objects.filter(listing=listingData)
    isOwner = request.user.username == listingData.owner.username

    if int(newBid) > listingData.price.bid:
        updateBid = Bid(user=request.user, bid=int(newBid))
        updateBid.save()
        listingData.price = updateBid
        listingData.save()
        return render(request, "auctions/listing.html", {
            "listing":listingData,
            "message": "Bid Successful",
            "listingInWatch": listingInWatch,
            "allComments": allComments,
            "isOwner": isOwner,
        })
    else:
        return render(request, "auctions/listing.html", {
            "listing":listingData,
            "message": "Bid Failed",
            "listingInWatch": listingInWatch,
            "allComments": allComments,
            "isOwner": isOwner,
        })

        
def closeAuction(request, id):
    listingData = Listing.objects.get(pk=id)
    listingData.isActive = False
    listingData.save()
    listingInWatch = request.user in listingData.watchlist.all()
    allComments = Comment.objects.filter(listing=listingData)
    isOwner = request.user.username == listingData.owner.username
    return render(request, "auctions/listing.html", {
        "listing": listingData,
        "listingInWatch": listingInWatch,
        "allComments": allComments,
        "isOwner": isOwner,
        "update": True,
        "message": "you Auction is closed",
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")

from django.shortcuts import render
import markdown
import random 

from . import util

# function to change .md to .html
def md_to_html(title):
    # get content
    content = util.get_entry(title)
    markdowner = markdown.Markdown()
    # convert if there is a content
    if content:
        return markdowner.convert(content)
    else:
        return None

# read all entries
def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })

# read one entry
def entry(request, title):
    content = md_to_html(title)
    if content:
        return render(request, "encyclopedia/entry.html", {
            "title": title,
            "content": content
        })
    else:
        return render(request, "encyclopedia/error.html", {
            "message": "This entry does not exist"
        })
    
# search for an entry
def search(request):
    if request.method == "POST":
        title_search =request.POST['q']
        content = md_to_html(title_search)
        if content:
            return render(request, "encyclopedia/entry.html", {
            "title": title_search,
            "content": content
        })
        # get entry list
        entries = util.list_entries()
        # array for search result
        search_result = []
        # loop through entries
        for entry in entries:
            # lower case search item is a subset of lower case entry
            if title_search.lower() in entry.lower():
                # then eppend to array
                search_result.append(entry)

        # there is result after searching
        if len(search_result) > 0:
            return render(request, "encyclopedia/search.html", {
            "search_result": search_result
            })
        # no result after searching
        else:
            return render(request, "encyclopedia/error.html", {
            "message": "This entry does not exist"
        })

# create a new entry
def new_page(request):
    # go to New Page if link "create new page" is clicked
    if request.method == "GET":
        return render(request, "encyclopedia/new.html")
    # POST entry
    if request.method == "POST":
        title = request.POST['title']
        content = request.POST['content'] 
        # new title already exists => send error message
        if title in util.list_entries():
            return render(request, "encyclopedia/error.html", {
                "message": "Title and content already exists"
            })
        # new title does not exist => save => display on entry page
        else:
            util.save_entry(title, content)
            new_content = md_to_html(title)
            return render(request, "encyclopedia/entry.html", {
                "title": title,
                "content": new_content
            })

# update an entry
# step 1: display edit form with previous entry
def edit(request):
    if request.method == "POST":
        title = request.POST['title_entry']
        content = util.get_entry(title)
        return render(request, "encyclopedia/edit.html", {
            "title": title,
            "content": content
        })

# step 2: save the update
def save_edit(request):
    if request.method == "POST":
        title = request.POST['title']
        content = request.POST['content']
        util.save_entry(title, content) 
        new_content = md_to_html(title)
        return render(request, "encyclopedia/entry.html", {
            "title": title,
            "content": new_content
        })

# function for random page generator
def random_page(request):
    # list of entries
    entries = util.list_entries()
    # random title and its content
    random_title = random.choice(entries)
    random_content = md_to_html(random_title)
    # return random entry ot the entry.html
    return render(request, "encyclopedia/entry.html", {
        "title": random_title,
        "content": random_content
    })

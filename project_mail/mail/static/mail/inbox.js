document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // any time compose form in email is filled and submitted, send_email function is called
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-detail-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

// specification task 1 (send mail)
// function called when you submit a composed email
function send_email(event){
  // The page will not reload everytime the submit button is used
  event.preventDefault();

  // declaring 3 variables to submit for POST request
  let recipients = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;

  // POST request to /emails with 3 pieces of data
  // from the lecture notes
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  })

  // calls the load_mailbox function with variable 'sent'
  load_mailbox('sent');
}


// specification task 2 (Mailbox)
// Function to load the specified mailbox
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Fetch the emails for the specified mailbox
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // Loop through each email object
      emails.forEach(email => {
        // Create a new div for each email
        const newEmail = document.createElement('div');

        // Set the class based on whether the email is read
        newEmail.className = email.read ? "read" : "unread";

        // Add the Bootstrap class for styling
        newEmail.classList.add("list-group-item");

        // Populate the div with the sender, subject, and timestamp
        newEmail.innerHTML = `
        <div class="loadmail-view">
         <div class="content">
           <div class="sender"> ${email.sender}</div>
           <div class="subject"> ${email.subject}</div>
          </div>
          <div class="timestamp"> ${email.timestamp}</div>
        </div>
        `;

        // Add an event listener to view the email details when clicked
        newEmail.addEventListener('click', function() {
          view_email(email.id);
        });

        // Append the new email div to the emails view
        document.querySelector('#emails-view').append(newEmail);
      });
    });
}


// Function to view a specific email based on its ID
function view_email(id) {
  // specification task 3 (view email)
  // Fetch the email details from the server using the email ID
  fetch(`/emails/${id}`)
    .then(response => response.json()) // Parse the response as JSON
    .then(email => {
      // Log the email details to the console for debugging
      console.log(email);

      // Hide the email list view and the compose email view
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      // Show the email detail view
      document.querySelector('#email-detail-view').style.display = 'block';

      // Populate the email detail view with the email's information
      document.querySelector('#email-detail-view').innerHTML = `
      <ul class="list-group">
        <li class="list-group-item"><b>From:</b> <span>${email.sender}</span></li>
        <li class="list-group-item"><b>To: </b><span>${email.recipients}</span></li>
        <li class="list-group-item"><b>Subject:</b> <span>${email.subject}</span></li>
        <li class="list-group-item"><b>Time:</b> <span>${email.timestamp}</span></li>
        <li class="list-group-item"><br/>${email.body}</li>
      </ul>
      `;

      // If the email is unread, mark it as read by sending a PUT request to the server
      if (email.read == false) {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({ read: true })
        });
      }
      // specification task 4 (archive and unarchive)
      // Create the archive/unarchive button
      const archiveBtn = document.createElement('button');
      archiveBtn.innerHTML = email.archived ? 'Unarchive' : 'Archive';
      archiveBtn.className = "btn btn-secondary";
      // Add an event listener to handle the archive/unarchive functionality
      archiveBtn.addEventListener('click', function() {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({ archived: !email.archived })
        })
        .then(() => {
          // Reload the inbox after archiving/unarchiving
          load_mailbox('inbox');
        });
      });
      // Append the archive/unarchive button to the email detail view
      document.querySelector('#email-detail-view').append(archiveBtn);

      // specification task 5 (Reply)
      // Create the reply button
      const reply = document.createElement('button');
      reply.className = "btn btn-info m-2";
      reply.innerHTML = "Reply";
      // Add an event listener to handle the reply functionality
      reply.addEventListener('click', function() {
        // Show the compose email view
        compose_email();

        // Pre-fill the recipients field with the original sender's email
        document.querySelector('#compose-recipients').value = email.sender;
        
        // Pre-fill the subject field, prepending "Re:" if not already present
        let subject = email.subject;
        if (subject.split(" ", 1)[0] != "Re:") {
          subject = "Re: " + subject;
        }
        document.querySelector('#compose-subject').value = subject;

        // Pre-fill the body field with the original email's body, formatted for quoting
        let body = `
          On ${email.timestamp}, ${email.sender} wrote: ${email.body}
        `;
        document.querySelector('#compose-body').value = body;
      });
      // Append the reply button to the email detail view
      document.querySelector('#email-detail-view').append(reply);
    });
}
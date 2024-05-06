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
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // set the email detail view to none  ??????????????????????????????????
  // document.querySelector('#email-detail-view').style.display = 'none';

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // from hints on specifications
    // using foreach we loop through the email objects
    emails.forEach(email => {
      // from hints on specifications
      // create an html element and add and event handler to it

      // new div
      const newEmail = document.createElement('div');

      // for background color
      // is this working ?????????????????????????????????
      // if (email.read) {
      //   newEmail.className == "read"
      // }
      // else {
      //   newEmail.className == "unread"
      // }

      // is it read ?
      newEmail.className = email.read ? "read" : "unread";

      // bootstrap 
      newEmail.className = "list-group-item";

      // newEmail.innerHTML = `
      //   <h6>${email.sender}</h6>
      //   <p>${email.subject}</p>
      //   <p>${email.timestamp}</p>
      // `;

      // only adding the sender, subject and timestamp in div
      newEmail.innerHTML = `
      <span> <strong>${email.sender}</strong> </span>
      <span> ${email.subject}</span>
      <span> ${email.timestamp}</span>
      `;

      // view email details using email id
      newEmail.addEventListener('click', function() {
        view_email(email.id)
      });

      // 
      document.querySelector('#emails-view').append(newEmail);
    });
  });
}


function view_email(id) {
  console.log(id);
}

// // specification task 3 (view email)
// function view_email(id){
//   // You’ll likely want to make a GET request to /emails/<email_id> to request the email.
//   fetch(`/emails/${id}`)
//   .then(response => response.json())
//   .then(email => {
//     // Print email
//     //console.log(email);
    
//     // show email detail and hide other views
//     document.querySelector('#emails-view').style.display = 'none';
//     document.querySelector('#compose-view').style.display = 'none';
//     // document.querySelector('#email-detail-view').style.display = 'block';
  
//     // If we use createElement, it will amount divs every time we go back

//     // display email details
//     document.querySelector('#email-detail-view').innerHTML = `
//       <ul class="list-group">
//         <li class="list-group-item"><b>From:</b> <span>${email['sender']}</span></li>
//         <li class="list-group-item"><b>To: </b><span>${email['recipients']}</span></li>
//         <li class="list-group-item"><b>Subject:</b> <span>${email['subject']}</span</li>
//         <li class="list-group-item"><b>Time:</b> <span>${email['timestamp']}</span></li>
//         <li class="list-group-item"><br/>${email['body']}</li>
//       </ul>
//     `;

//     // Once the email has been clicked on, you should mark the email as read. 
//     if (!email['read']) {
//       fetch('/emails/' + email['id'], {
//         method: 'PUT',
//         body: JSON.stringify({ read : true })
//       })
//     }

//     // Allow users to reply to an email.
//     // const reply = document.createElement('button');
//     // reply.className = "btn btn-primary m-2";
//     // reply.innerHTML = "Reply";
//     // reply.addEventListener('click', function() {
//     //   compose_email();

//     //   // populate fields with information from email
//     //   document.querySelector('#compose-recipients').value = email['sender'];
//     //   let subject = email['subject'];
//     //   //console.log(subject.split(" ", 1)[0]);
//     //   if (subject.split(" ", 1)[0] != "Re:") {
//     //     subject = "Re: " + subject;
//     //   }
//     //   document.querySelector('#compose-subject').value = subject;

//     //   let body = `
//     //     On ${email['timestamp']}, ${email['sender']} wrote: ${email['body']}
//     //   `;
//     //   document.querySelector('#compose-body').value = body;

//     // });
//     // document.querySelector('#email-detail-view').appendChild(reply);

    
    
//     //  Allow users to archive and unarchive emails that they have received.
//     // archiveButton = document.createElement('button');
//     // archiveButton.className = "btn btn-secondary m-1";
//     // archiveButton.innerHTML = !email['archived'] ? 'Archive' : 'Unarchive';
//     // archiveButton.addEventListener('click', function() {
//     //   fetch('/emails/' + email['id'], {
//     //     method: 'PUT',
//     //     body: JSON.stringify({ archived : !email['archived'] })
//     //   })
//     //   .then(response => load_mailbox('inbox'))
//     // });
//     // document.querySelector('#email-detail-view').appendChild(archiveButton);
//   })



//   // Catch any errors and log them to the console
//   // .catch(error => {
//   //   console.log('Error:', error);
//   // });
// }
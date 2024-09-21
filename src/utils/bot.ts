// import { google } from 'googleapis';
// import readline from 'readline';
// import { OAuth2Client } from 'google-auth-library';

// // Replace with your own OAuth credentials
// const CLIENT_ID = process.env.CLIENT_ID || 'your-client-id';
// const CLIENT_SECRET = process.env.CLIENT_SECRET || 'your-client-secret';
// const REDIRECT_URI = 'http://localhost:8080'; // Use the redirect URI you configured

// // OAuth2 scope for accessing Google Meet or Calendar events
// const SCOPES = ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar.readonly'];

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// // Create an OAuth2 client
// const oauth2Client = new google.auth.OAuth2(
//   CLIENT_ID,
//   CLIENT_SECRET,
//   REDIRECT_URI
// );

// // Generate an auth URL
// function getAuthUrl(): string {
//   return oauth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES
//   });
// }

// // Get access token using the authorization code
// async function getAccessToken(code: string) {
//   const { tokens } = await oauth2Client.getToken(code);
//   oauth2Client.setCredentials(tokens);
//   console.log('Successfully authenticated!');
//   return tokens;
// }

// // Fetch Google Calendar events (can be used to join a Google Meet from the calendar)
// async function listUpcomingEvents(auth: OAuth2Client) {
//   const calendar = google.calendar({ version: 'v3', auth });
//   const res = await calendar.events.list({
//     calendarId: 'primary',
//     timeMin: new Date().toISOString(),
//     maxResults: 10,
//     singleEvents: true,
//     orderBy: 'startTime',
//   });

//   const events = res.data.items;
//   if (!events || events.length === 0) {
//     console.log('No upcoming events found.');
//     return;
//   }

//   console.log('Upcoming events:');
//   events.map((event, i) => {
//     const start = event.start?.dateTime || event.start?.date;
//     const hangoutLink = event.hangoutLink || 'No Google Meet link';
//     console.log(`${start} - ${event.summary}: ${hangoutLink}`);
//   });
// }

// // Function to join Google Meet
// async function joinGoogleMeet(meetingUrl: string) {
//   console.log(`Joining Google Meet: ${meetingUrl}`);
//   const { default: open } = await import('open'); // Dynamic import
//   await open(meetingUrl);
// }

// // Main function to handle OAuth and joining a Google Meet
// export async function authenticateAndJoinMeet(meetingUrl: string) {
//   const authUrl = getAuthUrl();
//   console.log(`Authorize this app by visiting this URL: ${authUrl}`);
//   const { default: open } = await import('open'); // Dynamic import
//   open(authUrl); // Opens the auth URL in the default browser

//   rl.question('Enter the code from the page here: ', async (code: string) => {
//     try {
//       const tokens = await getAccessToken(code);

//       // Now you can join the meeting or fetch calendar events
//       if (meetingUrl) {
//         await joinGoogleMeet(meetingUrl);
//       } else {
//         await listUpcomingEvents(oauth2Client);
//       }
//     } catch (error) {
//       console.error('Error authenticating or fetching data:', error);
//     } finally {
//       rl.close();
//     }
//   });
// }


// // Example usage: Replace with your Google Meet link or leave it empty to fetch upcoming events
// // const meetingUrl = 'https://meet.google.com/your-meeting-id';
// // authenticateAndJoinMeet(meetingUrl);

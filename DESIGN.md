# Pre-Health Website Design

## Outcomes
The project met all of its "better" outcomes and several of its "best" outcomes. They are summarized as follows:
- Website connects students to alumni and health professionals
- Website displays information about internships
- Students can share their internship experiences
- Alumni and professional can securely submit their information themselves

## Tools
- Github
- Supabase
- React
- TypeScript
- Vite
- CSS
- ESLint
- npm

## High-Level Structure
The main file for the website is the app.tsx file. It contains all the state and logic. This is therefore the main hub and passes everything down as props to the page component files. This gives us a cleaner design with all the logic in one file. This also avoids duplication and provides a more efficient code setup, making it easier to find and edit the functions.
## Features

### Signing In
We limited website access to users with an @sattler.edu email to tighten security and because the webpage is really only for the Sattler Pre-Health Association. AuthScreens.tsx display a sign-in page that allows users to sign in with their Sattler Google email. App.tsx checks if the user is signed in, whether they've clicked the sign-in button, and whether their email is allowed. If the email is allowed, the session is stored. If not, the user gets sent back to the sign-in page. An error gets displayed.

### Submitting Information
There two are routes by which users can submit their information to the Directory page, one for signed-in users and one for professionals outside of the Sattler community. App.tsx checks whether the user is on the public submission page or if their on the private by looking at the path part of the URL. If it's a signed-in user, it simply renders the normal submission page in the website. If the route is from the public submission page, then it renders a version of the submission page that doesn't require the user to sign in. The page also doesn't include the navbar buttons. If signed-in users want to share the public submission page with an outside user, the link to the public submission page is listed in the private submission page.

An admin must approve submissions before they are displayed on the website. Submissions go to a "queue", a table in Supabase called "alumni_submissions". After approval, the data is put into a table called "contact" from which the displayed data is fetched.

### Admin Functionalities
Another design feature we implemented is an is_admin function in our React code. This checks whether the user is an admin and only displays buttons for editing and deleting comments or submissions if they are an admin. We did this to provide a cleaner interface rather than just blocking users from editing certain row tables at the Supabase level. However, since someone could bypass the user interface and edit the tables directly in Supabase, we decided that it would be a better design to also implement row-level security at the Supabase level, though we generally trust the users not to have malicious intent. We did this via a catch RLS policy that denies the request entirely without inserting anything into Supabase.
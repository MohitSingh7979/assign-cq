User story 1:
    Create a homepage where the user can either log in or move to the new account webpage

User story 2:
    A webpage that shows up when the user has tried to log in but entered an illegal name
    or password.

User story 3:
    A “create account” webpage that allows the user to create a new account. Please check
    if a user with the same email id already exists, don't allow for registration.

User story 4:
    Display the name of the user and an option for logout on the dashboard page
    after log in.

-----------------------------------------------------------------------
client-side:
    comps:
        header.ejs
    views:
        index.ejs
        signin.ejs
        signup.ejs

-----------------------------------------------------------------------
server-side:
    endpoints for pages:
        GET / -> index.ejs --> signin.ejs
        GET /signin -> signin.ejs
        GET /signup -> signup.ejs
    
    endpoints for actions:
        User:
            POST /user/:id -> password from query -> { id, name, todolist_id }
            POST /user?id&name&password -> saved to users.json
            DELETE /user/:id -> logout user or deleting from session

        TODOlist: user must be login
            GET /todolist/:id -> session.id -> get todolist_id -> {}
            POST /todolist?task -> generates task_id and saved to todolists.json
            GET /task/:id -> get isComplete and toggle it
            DELETE /task/:id -> delete task and removes from todolists.json
        
    

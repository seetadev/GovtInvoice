from flask import redirect, session

class UserLogoutHandler:
    @staticmethod
    def get():
        # Clear the user session
        session.pop('user', None)
        # Redirect to the login page
        return redirect('login')

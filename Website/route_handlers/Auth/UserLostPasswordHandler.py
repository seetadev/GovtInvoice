from flask import render_template, request, make_response
import logging
import cloud
import string
import random
from email.message import EmailMessage

class UserLostPasswordHandler:
    @staticmethod
    def get():
        # Send the lost password page
        response = make_response(render_template("lostpassword.html", user=None))
        response.delete_cookie('user')
        return response

    @staticmethod
    def post():
        user = request.form.get('email')
        logging.info(user)

        # Verify if user exists
        if not cloud.authenticate.user.user_exists(user):
            return render_template("lostpassword-baduser.html", reguser=user)

        # Send email with password reset link
        UserLostPasswordHandler.send_lost_pw_email(user)
        return render_template("lostpassword-sentemail.html", reguser=user)

    @staticmethod
    def send_lost_pw_email(user):
        dongle = UserLostPasswordHandler.get_random_string(20)
        cloud.authenticate.user.set_user_dongle(user, dongle)
        link = UserLostPasswordHandler.get_lost_pw_link(user, dongle)
        msg = f"Please click the following link to reset password for user {user}\n{link}"
        logging.info(msg)

        message = EmailMessage()
        message['Subject'] = 'Reset Password'
        message.set_content(msg)

        # TODO : Replace with your email sending code (e.g., Flask-Mail or other)
        # Example using print to simulate sending
        print(f"Email sent to {user}: {msg}")

    @staticmethod
    def get_random_string(size):
        char_set = string.ascii_uppercase + string.digits
        return ''.join(random.sample(char_set, size))

    @staticmethod
    def get_lost_pw_link(user, dongle):
        # Example link generation, adjust as per your application's needs
        return f"http://{request.host}/pwreset?u={user}&d={dongle}"

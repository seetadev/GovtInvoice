from flask import render_template, request, session, redirect, url_for
import logging
import cloud

class PWResetHandler:
    @staticmethod
    def get():
        # Retrieve user and dongle from the request arguments
        user = request.args.get('u')
        dongle = request.args.get('d')
        logging.info(user)
        logging.info(dongle)
        
        # Verify the dongle
        if dongle and dongle == cloud.authenticate.user.get_user_dongle(user):
            return render_template("pwreset.html", reguser=user)
        
        # Invalid dongle or user
        return render_template("pwreset-invalid.html", reguser=user)

    @staticmethod
    def post():
        user = request.form.get('email')
        password = request.form.get('password')
        logging.info(user)
        logging.info(password)
        
        # Verify if user exists
        if not cloud.authenticate.user.user_exists(user):
            return render_template("lostpassword-baduser.html", reguser=user)
        
        # Update the user's password
        cloud.authenticate.user.update_password(user, password)
        return render_template("pwreset-ok.html", reguser=user)

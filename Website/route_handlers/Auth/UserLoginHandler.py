from flask import render_template, request, redirect, make_response,session
import logging
import cloud

class UserLoginHandler:
    @staticmethod
    def get():
        session.pop('user', None)
        response = make_response(render_template("userlogin.html", user=None))
        return response

    @staticmethod
    def post():
        # Verify user login
        user = request.form.get('email')
        password = request.form.get('password')
        logging.info(user)
        logging.info(password)
        if cloud.authenticate.user.authenticate_user(user, password):
            logging.info("authenticate succeeded")
            response = redirect('/save')
            session['user'] = user
        else:
            logging.info("authenticate failed")
            response = redirect('login')
        return response

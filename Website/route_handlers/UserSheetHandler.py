from flask import render_template, request, redirect, session,jsonify
import logging
from cloud.storage.storage import deleteFile,getFile

import string
import random

def get_random_string(size):
    char_set = string.ascii_uppercase + string.digits
    return ''.join(random.sample(char_set, size))

class UserSheetHandler:
    @staticmethod
    def post():
        if 'user' not in session:
            return redirect('/')
        user = session['user']

        fname = request.form.get("pagename")
        logging.info(request.form)

        path = ["home", user, fname]
        
        # Check if delete parameter is set to delete the file
        if request.form.get("delete") == "yes":
            logging.info(f"Deleting {fname}")
            deleteFile(path)
            return redirect('save')
        
        session_id = get_random_string(6)
        logging.info(f"Session ID is {session_id}")

        fileobj = getFile(path)

        if fileobj is None:
            logging.info(f"File not found: {fname}")
            return redirect('/save')
        
        entry = {
            'fname': fname,
            'sheetstr': fileobj.data,
            'sheetmscestr': "", 
            'session': session_id
        }

        # Render template with entry data
        return render_template("importcollabload.html", entry=entry)
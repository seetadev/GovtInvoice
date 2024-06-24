from flask import render_template, request, redirect, session,jsonify
import logging
from cloud.storage.storage import getFile,createDir,createFile,updateFile
import json

class SaveHandler:
    @staticmethod
    def get():
        if 'user' not in session:
            return redirect('/')
        
        user = session['user']

        path = ["home", user]
        dirobj = getFile(path)

        if not dirobj or len(dirobj.files) == 0:
            logging.info("no directory")
            createDir(path)
            filedata = {
                "user": user,
                "fname": "default",
                "data": "\n"
            }
            fpath = path + ["default"]
            logging.info(fpath)
            createFile(fpath, json.dumps(filedata))
            dirobj = getFile(path)

        entries = dirobj.files
        logging.info(entries)
        logging.info("done")

        return render_template("allusersheets.html", entries=entries)

    def post():
        if 'user' not in session:
            return redirect('/')
        
        user = session['user']

        fname = request.form.get('fname')
        logging.info("fname is " + fname)
        sheetstr = request.form.get("data", None)
        path = ["home", user, fname]

        if sheetstr is not None:
            fileobj = getFile(path)
            if fileobj is None:
                createFile(path, sheetstr)
            else:
                updateFile(path, sheetstr)

        return jsonify(data="Done")


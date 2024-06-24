"""
Cloud Storage Infrastructure

using amazon S3
"""

import json

from boto.s3.connection import S3Connection
from boto.s3.key import Key
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# S3 connection
connection = S3Connection(os.getenv("AWS_ACCESS_KEY_ID"),os.getenv("AWS_SECRET_ACCESS_KEY"))
AspiringStorageBucket = os.getenv("S3_BUCKET_NAME")

print("Starting cloud import");

#
# The following are the base ITEM key, value APIs
#    Using this key,value storage is built a
#    user storage metaphor
#


# store a user item
# returns True/False
def putItem(path, filedata, bucket_name=None):
    if bucket_name==None:
        bucket_name = AspiringStorageBucket
    bucket = getBucket(bucket_name)
    k = Key(bucket)
    k.key = path
    #can set metadata to the key
    #k.set_metadata("date","some date string")
    k.set_contents_from_string(filedata);
    return True

# get a user item
# returns data/None
def getItem(path, bucket_name=None):
    try:
        if bucket_name==None:
            bucket_name = AspiringStorageBucket
        bucket = getBucket(bucket_name)
        k = Key(bucket)
        k.key = path
        data = k.get_contents_as_string()
        return data
    except:
        return None

# does item exist
# returns boolean
def existsItem(path, bucket_name=None):
    try:
        if bucket_name==None:
            bucket_name = AspiringStorageBucket
        bucket = getBucket(bucket_name)
        k = Key(bucket)
        k.key = path
        return k.exists()
    except:
        return False


# delete a user item
# returns True/False
def deleteItem(path, bucket_name=None):
    if bucket_name==None:
        bucket_name = AspiringStorageBucket
    bucket = getBucket(bucket_name)
    k = Key(bucket)
    k.key = path
    k.delete()
    return True

#  The following are helpers to implement the API

def createBucket(bucketname):
    conn = getConnection()
    bucket = conn.create_bucket(bucketname)
    return bucket

def getBucket(bucketname):
    conn = getConnection()    
    bucket = conn.get_bucket(bucketname)
    return bucket

def getConnection():
    # may need to check if conn is alive etc
    return connection

#
#
#  The following are user file abstraction
#    built using a key-value storage
#
#  The abstraction is simple
#  The path to the file is the key
#  The metadata on the key indicates if it is a file or directory
#  If it is a directory, then, it contains the list of files as the value
#  which gets updated when files get added or deleted 
#
#  Note that the user is embedded into the filesystem path
#
#  path itself is a stringified json list
#
#

# path manipulation apis

# first define dir, and file classes

class File:
    def __init__(self,name,data):
        self.fname = name
        self.data = data

class Directory:
    def __init__(self,name,filelist):
        self.fname = name
        self.files = [File(i,"") for i in filelist]


def pathToString(path):
    return json.dumps(path)

# path is a list
# returns True/False
def createDir(path):
    # check if dir exists, if so fail
    spath = pathToString(path)
    data = getItem(spath)
    if (data != None):
        print("dir exists");
        return False
    # create the dir file
    dirdata = {}
    dirdata["data"] = json.dumps([])
    dirdata["path"] = path
    dirdata["type"] = "dir"
    if not (putItem(spath, json.dumps(dirdata))):
        print("putitem failed");
        return False
    #print("createDir passed"    );
    return True
    
    
def deleteDir(path):
    # not implemented yet
    pass


# path is list, return python file object
def getFileRaw(path):
    spath = pathToString(path)
    data = getItem(spath)
    if (data == None):
        return None
    filedata = json.loads(data)
    return filedata

# path is list, returns directory object or file object as the case
# may be
def getFile(path):
    data = getFileRaw(path)
    print("getfile",data);
    if data == None:
        return None
    if data["type"] == "dir":
        fileslist = json.loads(data["data"])
        fname = path[len(path)-1]
        fileobj = Directory(fname, fileslist)
        return fileobj
    elif data["type"] == "file":
        fname = path[len(path)-1]
        fileobj = File(fname, data["data"])
        return fileobj
    else:
        return None

##
## path is list, data is a string
##
def createFile(path, data):
    # make sure parent dir exists
    if len(path) <= 1:
        print("parent path failed");
        return False
    ppath = path[:-1]    
    parentdata = getFileRaw(ppath)
    if parentdata == None:
        print("parent data failed"        );
        return False
    # check if file exists
    spath = pathToString(path)
    if getItem(spath) != None:
        print("file exists failed"                );
        return False
    # update the file
    filedata = {}
    filedata["data"] = data
    filedata["path"] = path
    filedata["type"] = "file"
    if (not putItem(spath, json.dumps(filedata))):
        print("putfile failed"                );
        return False
    # the update the directory
    fname = path[len(path)-1]
    fileslist = json.loads(parentdata["data"])
    fileslist.append(fname)
    parentdata["data"] = json.dumps(fileslist)    
    if (not putItem(pathToString(ppath), json.dumps(parentdata))):
        # this is unexpected, unwind !
        print("putdir failed"                        );
        deleteFile(path)
        return False
    return True
    
##
## path is list, data is a string
##    
def updateFile(path, data):
    # file must exist
    filedata = getFileRaw(path)
    if (filedata == None):
        return False
    filedata["data"] = data
    if not putItem(pathToString(path), json.dumps(filedata)):
        return False
    return True

##
## path is list
##
def deleteFile(path):
    filedata = getFileRaw(path)
    if filedata == None or filedata["type"] != "file":
        print("file does not exist");
        return False
    #
    # update the parent directory first
    #
    ppath = path[:-1]    
    parentdata = getFileRaw(ppath)
    if parentdata == None:
        print("parent data failed"        );
        return False
    fileslist = json.loads(parentdata["data"])
    newlist = []
    fname = path[len(path)-1]
    for i in fileslist:
        if fname == i:
            pass
        else:
            newlist.append(i)
    parentdata["data"] = json.dumps(newlist)
    if (not putItem(pathToString(ppath), json.dumps(parentdata))):
        # this is unexpected, unwind !
        print("putdir failed"                        );
        return False
    # then delete the file
    if not deleteItem(pathToString(path)):
        print("delete file failed");
        return False
    return True


#### The following are unit tests

def unitTestItems():
    putItem("foobar1","test1")
    print(getItem("foobar1"))
    putItem("foobar2","test2")    
    print(getItem("foobar2"))
    deleteItem("foobar1")
    deleteItem("foobar2")
    print(getItem("foobar1")    )
    print(getItem("foobar2")    )

def unitTestItemsInBucket():
    bkt_name = "aspiring-pdf-files"
    putItem("foobar1","test1", bkt_name)
    print(existsItem("foobar1", bkt_name))
    print(getItem("foobar1", bkt_name))
    putItem("foobar2","test2", bkt_name)    
    print(existsItem("foobar2", bkt_name))
    print(getItem("foobar2", bkt_name))
    deleteItem("foobar1", bkt_name)
    deleteItem("foobar2", bkt_name)
    print(existsItem("foobar1", bkt_name))
    print(existsItem("foobar1", bkt_name))
    print(getItem("foobar1", bkt_name)    )
    print(getItem("foobar2", bkt_name)    )


def unitTestFiles():
    path = ["home","demo"]
    print("--create dir--");
    createDir(path)
    print(getFileRaw(path))
    fpath = path[:]
    fpath.append("fname")
    print("--del file--"    );
    deleteFile(fpath)
    print("--create file--"        );
    createFile(fpath, "FileData Test1")
    print(getFileRaw(fpath))
    print(getFileRaw(path))
    print(str(getFile(fpath)))
    print("--update file--"        );
    updateFile(fpath, "FileData Test2")
    print(getFileRaw(fpath))
    print(getFileRaw(path))
    print(str(getFile(fpath)))
    print("--create second file--");
    fpath2 = path[:]
    fpath2.append("fname2")    
    createFile(fpath2, "FileData2 Test1")
    print(getFileRaw(fpath2))
    print(getFileRaw(path))
    print(str(getFile(fpath2)))
    print("--update second file--"        );
    updateFile(fpath2, "FileData2 Test2")
    print(getFileRaw(fpath2))
    print(getFileRaw(path))
    print(str(getFile(fpath2)))
    print("--del file--"    );
    deleteFile(fpath)
    print(getFileRaw(path))
    print(str(getFile(fpath)))
    deleteFile(fpath2)
    print(getFileRaw(path))
    print(str(getFile(fpath)))
    
print("Cloud imported");

if __name__ == "__main__":
    # unit tests here
    #unitTestItems()
    #unitTestFiles()
    unitTestItemsInBucket()

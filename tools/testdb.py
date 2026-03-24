from pymongo import MongoClient


def get_database(dbName):
   CONNECTION_STRING = "mongodb://localhost/"
   client = MongoClient(CONNECTION_STRING)
   return client[dbName]


def get_collection(db, collectionName):
    return db[collectionName]


def get_documents(col):
    return col.find()    

 
# This is added so that many files can reuse the function get_database()
if __name__ == "__main__":   
    docs = get_documents(get_collection(get_database('test'), 'posts'))
    for item in docs:
        print(item)
        print(item['title'])


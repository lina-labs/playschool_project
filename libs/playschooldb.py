import sys
import csv
import json
from pymongo import MongoClient
import re

CONNECTION_STRING = "mongodb://localhost/"
DB_NAME = "playschool"
COLLECTION_NAME = "story"


class ScenesDB:
    def __init__(self, db_name=DB_NAME, coll_name=COLLECTION_NAME):
        self.client = MongoClient(CONNECTION_STRING)
        self.db = self.client[db_name]
        self.collection = self.db[coll_name]

    def get_scene(self, no):
        doc = self.collection.find_one({'scene': no})
        return doc

    def ins_scene(self, no, **kwargs):
        self.collection.insert_one(kwargs)

    def upd_scene(self, no, **kwargs):
        query = {'scene': no}
        newvalue = {'$set': kwargs}
        self.collection.update_one(query, newvalue)

    def get_all_scenes(self):
        docs = self.collection.find().sort('scene')
        return docs

    def del_scene(self, no):
        doc = self.collection.find_one({'scene': no})
        self.collection.delete_one({'scene': no})

    def del_all_scenes(self):
        self.collection.delete_many({})

    def count(self):
        return self.collection.count()

    def get_template(self, no):
        doc = self.collection.find_one({'scene': no})
        if doc['template'] == '':
            return 'standard.html'
        return doc['template']

    def has_option(self, no):
        doc = self.collection.find_one({'scene': no})
        if doc['option'] != '':
            return True
        return False

    def get_next_scene(self, no):
        doc = self.collection.find_one({'scene': no})
        return doc['next']

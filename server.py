#!/usr/bin/python3
import os
import sys
from flask import Flask, render_template, send_file, request, make_response
import base64
import time
import json
import re

sys.path.append('libs')

from playschooldb import ScenesDB

app = Flask(__name__)
app.jinja_env.auto_reload = True
app.config["TEMPLATES_AUTO_RELOAD"] = True
db = ScenesDB()
SEL_LIMIT = {'2-2-5-1':1,'3-1-1':2,'4-1-1':2}

def delete_all_cookies(resp):
    cookies = request.cookies
    for cookie_name in cookies:
        resp.delete_cookie(cookie_name)

@app.route('/')
def start():
    type = request.args.get('t')
    role = ''
    if type is not None and type == 'teacher':        
        role = '?r=teacher'
    else:
        role='?r=student'
    resp = make_response(render_template('play.html', role=role)) 
    delete_all_cookies(resp)
    return resp

@app.route('/end')
def end():
    resp = make_response(render_template('end.html'))
    delete_all_cookies(resp)
    return resp
   
@app.route('/scenes/<no>', methods=['GET'])
def scenses(no):
    play = db.get_scene(no)
    template = db.get_template(no)

    #get url parameter
    press_prev = request.args.get('prev')
    press_curr = request.args.get('cur')
    role = request.args.get('r')
    press_overview = request.args.get('overview')

    #get all cookies
    curr_pos = int(request.cookies.get('current_pos',-1))
    prev_sc = request.cookies.get('prev_sc','')
    sc_name = request.cookies.get('sc_name','{}')
    sc_name_dict = json.loads(sc_name)
    
    #Change flag value if the option has been selected
    #count: number of the selected options in this playbook
    def mark_selected(playbook, count, new_op):
        new_op_list = []
        for index, option in enumerate(playbook['option']):
            if option['next'] in prev_sc_list:
                if new_op == True:
                    new_op_list.append(play['option'][index]) #determine which options should be showed
                option['flag'] = 1
                count[0] += 1
        #renew options
        if new_op == True:
            if no == '4-1-2':
                new_op_list.append(play['option'][4])
            play['option'] = new_op_list
        #add a new option after reaching the fourth scene
        if no == '3-1-1' and '4-1' in prev_sc_list:
            playbook['option'].append({"text": '不問了，先回家休息吧', "next": '4-1', "flag": 0})

    reachSelLimit ='false' #disable clicking on the options when reachSelLimit is True 
    prev_sc_list = prev_sc.split(',')
    if (press_prev is None and (curr_pos == len(prev_sc_list)-1 or curr_pos == -1) and press_curr is None):
        if prev_sc != '':
            prev_sc = prev_sc + ','
        prev_sc = prev_sc + no
        prev_sc_list = prev_sc.split(',')
        if play['sc_name'] != '':
            sc_name_dict[no] = play['sc_name']

    num_selected_op = [0] #this scene
    ref_selected_op = [0] #the other scene
    #Check if there is a '重新開始' option in the choice
    restart_op = False
    if play['option']!='':     
        for op in play['option']:
            if op['text'] == '重新開始':
                restart_op = True

    if (play['option'] != '' and restart_op == False)or play['next'] == '3-1-1':
        #determine which options should be showed
        if play['next'] == '3-1-1' or no == '4-1-1' or no == '4-1-2':
            new_op = False
            ref_sc_data = db.get_scene('3-1-1')
            if (no == '4-1-1' or no == '4-1-2') and role != 'teacher':
                new_op = True
            mark_selected(ref_sc_data, ref_selected_op, new_op)
        mark_selected(play, num_selected_op, False)
        
    #determine the current position
    if press_prev is not None:
        if restart_op == False:
            reachSelLimit = 'true'
        curr_pos = curr_pos -1 if curr_pos > 0 else curr_pos
    elif press_curr is not None:
        curr_pos = len(prev_sc_list)-1
    else:
        curr_pos = curr_pos + 1
        if curr_pos != len(prev_sc_list)-1 or (no == '3-1-1' and '4-1' not in prev_sc_list and num_selected_op[0] >= SEL_LIMIT['3-1-1']):
            reachSelLimit = 'true'
                
    #determine the previous page 
    prev_i = curr_pos -1 if curr_pos > 0 else curr_pos
    prev_page = prev_sc_list[prev_i]
    #determine the next page
    next_page = play['next'] 
    if curr_pos < len(prev_sc_list)-1:
        next_page = prev_sc_list[curr_pos+1]
    if press_prev is None:
        if play['next']=='3-1-1' and ref_selected_op[0] >= SEL_LIMIT['3-1-1'] and no != '3-1':
            next_page = '3-6'

    #get current scene
    curr_page = prev_sc_list[-1]
    
    overviewItems = {
            '0-1':{'flag':0, 'scName':'第零幕：起源'}, 
            '1-1':{'flag':0, 'scName':'第一幕：日常生活'}, 
            '2-1-1':{'flag':0, 'scName':'第二幕：事件的開始'},
            '3-1':{'flag':0, 'scName':'第三幕：只能靠朋友了！'},
            '4-1':{'flag':0, 'scName':'第四幕：重大的選擇'},
            '5-1':{'flag':0, 'scName':'第五幕：*$(#&@($&('}
    }
    #if the fifth scene is reached, update the name of the fifth scene in the overview.
    if '5-1' in prev_sc_list:
        overviewItems['5-1']['scName'] = '真相?'
    #if a scene in the overviewItems is has been visited, mark it.
    for key in overviewItems:
        if key in prev_sc_list:
            overviewItems[key]['flag']=1
    
    achievementItems = {
            '4-2-7-3':{'flag':0,  'scName':'子柔結局 - 帳密外流'},
            '4-3-7-6':{'flag':0, 'scName':'阿高結局 - 二次詐騙'},
            '4-4-5-3':{'flag':0, 'scName':'阿哲結局 - 遊戲交易'},
            '4-5-6-5':{'flag':0, 'scName':'小辛結局 - 個資安全'},
            '5-4-10-1':{'flag':0, 'scName':'真相結局1 - 阿嬤啊！真有這貨！'},
            '5-5-10-13':{'flag':0, 'scName':'真相結局2 - 爸…這或許才是對的…'},
            '5-5-11-11':{'flag':0, 'scName':'真相結局3 - 165的正義！Happy Ending？'},
            '5-7-3-9':{'flag':0, 'scName':'真相結局4 - 球鞋…難道…？'}
    }
    #if a scene in the overviewItems is has been visited, mark it.
    for key in achievementItems:
        if key in prev_sc_list:
            achievementItems[key]['flag']=1
        else:
            achievementItems[key]['scName'] = re.sub(r'- .*','- ????', achievementItems[key]['scName'])

    data = {
            'sc_name': sc_name_dict,
            'play': play,
            'next_page':next_page, 
            'prev_page': prev_page,
            'curr_page': curr_page,
            'reachSelLimit': reachSelLimit,
            'overviewItems': overviewItems,
            'achievementItems': achievementItems
    }
    resp = make_response(render_template(template,**data))
    sc_name=str(json.dumps(sc_name_dict))
    
    #set cookies
    resp.set_cookie('sc_name', sc_name)
    resp.set_cookie('prev_sc', prev_sc)
    resp.set_cookie('current_pos', str(curr_pos))
    return resp

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10080)

import sys
import csv
import json
import re
from playschooldb import ScenesDB
import glob

CONNECTION_STRING = "mongodb://localhost/"
DB_NAME = "playschool"
COLLECTION_NAME = "story"


def process_dialogue(dialogue):
    split_dialogue = dialogue.split('\n')
    new_dialogue = ""
    speaker = ""
    for sentence in split_dialogue:
        colon_index = sentence.find(":")
        if colon_index != -1:
            speaker = sentence.split(":")[0]
            new_segment = sentence.replace(speaker + ":", "", 1)
            new_dialogue += new_segment + "\n"
    return new_dialogue, speaker


def remove_unused_col(row):
    del row['item']
    del row['note']


def process_message(message):
    pattern = r'^[▼\n\s]+|[▼\n\s]+$'
    message = message.split('▼')
    message = [item for item in message if item.strip() !=
               '' and item.strip() != '\n']
    for j, sentence in enumerate(message):
        sentence = re.sub(pattern, '', sentence)
        message[j] = re.sub(r" +", '', sentence)
    return message


def determine_next_scene(i, rows, row):
    if i == len(rows)-1:
        row['next'] = ''
    else:
        next_row = rows[i+1]
        row['next'] = next_row['scene']


def process_option(row):
    if row['option'] != '':
        row['option'] = row['option'].strip()
        options = []
        if row['option'][0] == '(':
            row['next'] = row['option'][1:-1]
            row['option'] = ''
        else:
            segments = row['option'].split('\n')
            for segment in segments:
                text, next_value = segment.split('=>')
                toDictionary = {"text": text, "next": next_value, "flag": 0}
                options.append(toDictionary)
            row['option'] = json.loads(json.dumps(options, ensure_ascii=False))


def process_bg(row):
    if row['bgimg'] == '黑幕':
        row['bgimg'] = ''


def process_character(row):
    if row['charimg'] != '':
        row['charimg'] = row['charimg'].split('\n')


def process_all_data(scenes_csv_file):
    with open(scenes_csv_file, 'r', encoding='utf-8') as file:
        csvdata = csv.DictReader(file)
        rows = list(csvdata)
        roles = ['阿高', '子柔', '團長', '小辛', '阿高姐姐',
                 '店員', '團長爸', '學長', '阿嬤', '老師', '阿哲', '豬公', '反詐騙專員']
        person_to_css = {'小辛': 'smallFont.css'}

        for i, row in enumerate(rows):
            remove_unused_col(row)
            process_character(row)
            if row['message'] != "":
                row['message'] = process_message(row['message'])
                text = []
                msgDictionaries = []
                last_speaker = None
                msgtoDictionary = {}
                for j, sentence in enumerate(row['message']):
                    new_dialogue = ""
                    speaker = ""
                    inputDict = False
                    new_dialogue, speaker = process_dialogue(sentence)
                    if speaker not in roles or speaker == '':
                        speaker = ''
                        new_dialogue = sentence

                    if last_speaker == speaker or last_speaker == None:
                        text.append(new_dialogue)
                    else:  # last_speaker != speaker
                        msgDictionaries.append(msgtoDictionary)
                        inputDict = True
                        text = []
                        text.append(new_dialogue)
                    css_file = person_to_css.get(speaker, 'defaultFont.css')
                    msgtoDictionary = {"speaker": speaker, "text": text, "css": css_file}
                    last_speaker = speaker
                if inputDict == False:
                    msgDictionaries.append(msgtoDictionary)
                row['message'] = json.loads(json.dumps(msgDictionaries, ensure_ascii=False))
            determine_next_scene(i, rows, row)
            process_bg(row)
            process_option(row)
            storydb.ins_scene(no=row['scene'], **row)


if __name__ == "__main__":

    if len(sys.argv) == 1:
        print(f'Usage: {sys.argv[0]} import scenes_csv_filename')
        print(f'       {sys.argv[0]} show [scene no] [scene no]')
        sys.exit(0)
    if sys.argv[1] == 'import':
        storydb = ScenesDB(db_name=DB_NAME, coll_name='story')
        if sys.argv[2] == 'all':
            storydb.del_all_scenes()
            for scenes_csv_file in glob.glob('playbook*.csv'):
                process_all_data(scenes_csv_file)
        elif sys.argv[2] == 'delete':
            storydb.del_all_scenes()
        else:
            for i in range(2, len(sys.argv)):
                scenes_csv_file = sys.argv[i]
                process_all_data(scenes_csv_file)
    elif sys.argv[1] == 'show':
        storydb = ScenesDB(db_name=DB_NAME, coll_name='story')
        if len(sys.argv) == 2:
            for doc in storydb.get_all_scenes():
                print(doc)
        else:
            for no in sys.argv[2:]:
                print(storydb.get_scene(no))

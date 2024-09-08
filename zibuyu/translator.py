import json
import os
import jieba
from pypinyin import pinyin, Style
from pypinyin_dict.phrase_pinyin_data import cc_cedict
from deep_translator import GoogleTranslator
#from deep_translator import ChatGptTranslator

JSON_ZIBUYURAW_PATH = "zibuyu_raw.json"
JSON_ZIBUYU_PATH = "zibuyu.json"

FULL_BLACKLIST = ( "······", "？" )
ENGLISH_BLACKLIST = ()

cc_cedict.load()

def main():
    zibuyu_raw = json.load(open(JSON_ZIBUYURAW_PATH, encoding="utf-8"))
    zibuyu = []
    for page_raw in zibuyu_raw:
        page = []
        for text_raw in page_raw:
            if text_raw["hanyu"]:
                page.append(processText(text_raw))
        zibuyu.append(page)
    with open(JSON_ZIBUYU_PATH, "w", encoding="utf-8") as f:
        json.dump(zibuyu, f, indent=4, ensure_ascii=False)
    os.system("pause")

def processText(text_raw):
    hanyu_raw = text_raw["hanyu"]
    text = {}
    text["hanyu"] = hanyu_raw
    text["pinyin"] = ""
    text["english"] = ""
    if "pinyin" not in text_raw and hanyu_raw not in FULL_BLACKLIST:
        text["pinyin"] = getPinyin(hanyu_raw)
    if "english" not in text_raw and hanyu_raw not in FULL_BLACKLIST \
            and hanyu_raw not in ENGLISH_BLACKLIST:
        text["english"] = getEnglish(hanyu_raw)
    if "style" in text_raw:
        text["style"] = text_raw["style"]
    if "right" in text_raw:
        text["right"] = text_raw["right"]
    print(text)
    return text

def getPinyin(hanyu):
    pinyin_str = ""
    seg_list = jieba.cut(hanyu)
    for seg in seg_list:
        pinyin_str += "".join(mergeLists(pinyin(seg, v_to_u=True))) + " "
    return cleanPinyin(pinyin_str)

def mergeLists(lists):
    merged_list = []
    for list in lists:
        merged_list += list
    return merged_list

def cleanPinyin(pinyin_str):
    pinyin_str = pinyin_str.replace("。", ".")
    pinyin_str = pinyin_str.replace("，", ",")
    pinyin_str = pinyin_str.replace("？", "?")
    pinyin_str = pinyin_str.replace("！", "!")
    pinyin_str = pinyin_str.replace(" .", ".")
    pinyin_str = pinyin_str.replace(" ,", ",")
    pinyin_str = pinyin_str.replace(" ?", "?")
    pinyin_str = pinyin_str.replace(" !", "!")
    pinyin_str = pinyin_str.replace(" ·", "·")
    pinyin_str = pinyin_str.replace("· ", "·")
    return pinyin_str

def getEnglish(hanyu):
    return cleanEnglish(GoogleTranslator(source="zh-CN", target="en").translate(hanyu))
    #return ChatGptTranslator(source="zh-CN", target="en").translate(hanyu)

def cleanEnglish(english_str):
    english_str = english_str.replace("’", "'")
    return english_str

if __name__=="__main__":
    main()

#!/usr/bin/env python
# coding: utf8

import os
import json

Root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OutputDir = os.path.join(Root, "output-apps")

def get_app_dir(id):
    return os.path.join(OutputDir, id)

def get_category_dir(app_dir):
    return os.path.join(app_dir, "category")

def get_entity_dir(app_dir):
    return os.path.join(app_dir, "entity")

def load_json(lu_data, output_dir):
    JsonFile = os.path.join(output_dir, "temp.json")
    if os.path.exists(JsonFile):
        os.remove(JsonFile)

    LuFile = os.path.join(output_dir, "temp.lu")
    with open(LuFile, 'wb') as f:
        f.write(lu_data)
    cmd = "bf luis:convert --in {0} --out {1}".format(LuFile, JsonFile)
    os.system(cmd)

    with open(JsonFile) as f:
        return json.load(f)

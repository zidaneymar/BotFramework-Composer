from flask import Flask
from flask import request
from flask import make_response
from flask_cors import CORS
import spacy
import os
import uuid
import pathlib
from spacyserver import common, train_new_entity_type, train_textcat

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

id_models = dict()

def response_403(id):
    return add_response_header('App {0} is not updated correctly!'.format(id)), 403

def response_404(id):
    return add_response_header('App {0} does not exist!'.format(id)), 404

def add_response_header(content):
    rst = make_response(content)
    rst.headers['Access-Control-Allow-Origin'] = '*'
    rst.headers['Access-Control-Allow-Methods'] = 'PUT,GET,POST,DELETE'
    allow_headers = "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    rst.headers['Access-Control-Allow-Headers'] = allow_headers
    return rst

@app.route('/create_app')
def create_app():
    id = str(uuid.uuid4())
    app_dir = common.get_app_dir(id)
    pathlib.Path(app_dir).mkdir(parents=True, exist_ok=True)
    return add_response_header(id), 201
    # return id

@app.route('/update_app/<id>', methods=['POST'])
def update_app(id):
    app_dir = common.get_app_dir(id)
    print(app_dir)
    if not os.path.exists(app_dir):
        print('fail upload ----------------')
        return response_404(id)
    json_data = common.load_json(request.data, app_dir)
    nlp_c = train_textcat.main(json_data, output_dir=common.get_category_dir(app_dir))
    nlp_e = train_new_entity_type.main(json_data, output_dir=common.get_entity_dir(app_dir))
    id_models[id] = (nlp_c, nlp_e)
    return add_response_header(id), 201

def query_app(id, query):
    if not id in id_models:
        app_dir = common.get_app_dir(id)
        if not os.path.exists(app_dir):
            print('fail query---------------')
            return response_404(id)
        c_dir = common.get_category_dir(app_dir)
        e_dir = common.get_entity_dir(app_dir)
        try:
            nlp_c = spacy.load(c_dir)
            nlp_e = spacy.load(e_dir)
            id_models[id] = (nlp_c, nlp_e)
        except:
            return response_403(id)

    nlp_c, nlp_e = id_models[id]
    doc_category = nlp_c(query)
    doc_entity = nlp_e(query)
    return add_response_header({
        "cats": doc_category.cats,
        "ents": [(ent.label_, ent.text) for ent in doc_entity.ents],
    }), 201

@app.route('/query_app/<id>/<query>', methods=['GET'])
def query_app_get(id, query):
    return query_app(id, query)

@app.route('/query_app/<id>', methods=['POST'])
def query_app_post(id):
    return query_app(id, str(request.get_json()['query']))

if __name__ == '__main__':
    app.run(port=9000, debug=True)

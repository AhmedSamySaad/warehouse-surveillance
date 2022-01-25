import os, shutil, glob

import detect
from flask import Flask, render_template, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='static/assets', template_folder='templates')


@app.route('/')
def homepage():
    return render_template('index.html')


@app.route('/tmp', methods=['POST'])
def upload(): # This will handel the bones with bone type
    empty_directory('./tmp')
    image_files = request.files
    list_of_images=[]
    for key,value in image_files.items():
        list_of_images.append({
            'image':value,
        })
    list_of_results=[]
    for image in list_of_images:
        image_path = save_tmp_img(image)
        list_of_results.append({'image_path':image_path})
    response = jsonify({
        'success': True,
        'html_value': True,
        'list_results': list_of_results
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

def save_tmp_img(image):
    extension = secure_filename(image.get('image').filename).split('.')[-1]
    if not listdir_nohidden('./tmp'):
        filename="1."+ extension
    else:
        filename = str(len(listdir_nohidden('./tmp'))+1) + "." + extension
    # filename = secure_filename(image.get('image').filename) # save file 
    filepath = os.path.join('./tmp', filename)
    image.get('image').save(filepath)
    return filepath

def empty_directory(f):
    folder = f
    for file_path in listdir_nohidden(folder):
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print('Failed to delete %s. Reason: %s' % (file_path, e))

def listdir_nohidden(path):
    return glob.glob(os.path.join(path, '*'))

@app.route('/detect', methods=['POST'])
def inference():
    empty_directory('./runs/detect')
    form_data = request.form.to_dict()
    for file_path in listdir_nohidden("./tmp"):
        path = file_path
    detect.run(weights="./best.pt",source=path,imgsz=(int(form_data['size']),int(form_data['size'])),conf_thres=float(form_data['confidence']),iou_thres=float(form_data['iou']))
    response = jsonify({
        'success': True,
        'html_value': True,
        'filename':path.split('/')[-1],
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

# @app.route('/tmp/<path:filename>')
# def send_file(filename):
#     return send_from_directory("./tmp", filename, as_attachment=True)

@app.route('/runs/detect/exp/<path:filename>/<int:rand_id>')
def send_result(filename,rand_id):
    return send_from_directory("./runs/detect/exp", filename, as_attachment=True)

#test
if __name__ == '__main__':
    app.run()

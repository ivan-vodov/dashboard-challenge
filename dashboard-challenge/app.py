# import necessary libraries
#import json
import numpy as np
from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy


#################################################
# Flask Setup
#################################################
app = Flask(__name__)


#################################################
# Database Setup
#################################################
app.config[
    "SQLALCHEMY_DATABASE_URI"
] = "sqlite:///DataSets/belly_button_biodiversity.sqlite"
db = SQLAlchemy(app)


class sample_metadata(db.Model):
    __tablename__ = "samples_metadata"
    SAMPLEID = db.Column(db.Integer, primary_key=True)
    AGE = db.Column(db.Integer)
    BBTYPE = db.Column(db.String)
    ETHNICITY = db.Column(db.String)
    GENDER = db.Column(db.String)
    LOCATION = db.Column(db.String)
    WFREQ = db.Column(db.String)


class otu(db.Model):
    __tablename__ = "otu"
    otu_id = db.Column(db.Integer, primary_key=True)
    lowest_taxonomic_unit_found = db.Column(db.String)


class sample(db.Model):
    __tablename__ = "samples"
    __table_args__ = {"autoload": True, "autoload_with": db.engine}


# Main page route
@app.route("/")
def main():
    return render_template("/index.html")


# API - list of sample names
@app.route("/names")
def get_names():
    results = db.session.query(sample_metadata.SAMPLEID).all()
    names = np.ravel(results).tolist()
    names_mod = ["BB_" + str(i) for i in names]
    return jsonify(names_mod)


# API - list of OTUs
@app.route("/otu")
def get_otu_list():
    results = db.session.query(otu.lowest_taxonomic_unit_found).all()
    otu_list = np.ravel(results).tolist()
    return jsonify(otu_list)


# API - metadata for a given sample
@app.route("/metadata/<sample_input>")
def get_sample_metadata(sample_input):
    result = (
        db.session.query(sample_metadata)
        .filter(sample_metadata.SAMPLEID == int(sample_input[3:]))
        .first()
    )
    sample_metadata_fields = []
    sample_metadata_fields.append(
        {
            "AGE": result.AGE,
            "BBTYPE": result.BBTYPE,
            "ETHNICITY": result.ETHNICITY,
            "GENDER": result.GENDER,
            "LOCATION": result.LOCATION,
            "WFREQ": result.WFREQ,
        }
    )
    return jsonify(sample_metadata_fields)


# API - wash frequency number
@app.route("/wfreq/<sample_input>")
def get_wfreq(sample_input):
    result = (
        db.session.query(sample_metadata.WFREQ)
        .filter(sample_metadata.SAMPLEID == int(sample_input[3:]))
        .first()
    )
    return str(result.WFREQ)


# API - data for a given sample
@app.route("/samples/<sample_input>")
def get_sample(sample_input):
    # create a query to pull sample OTU and sample values, by sample values desc 
    results = eval(
        "db.session.query(sample.otu_id,sample."
        + sample_input
        + ").filter(sample."
        + sample_input
        + ">0).order_by(sample."
        + sample_input
        + ".desc()).all()"
    )
    otu_id_list = [result_entry[0] for result_entry in results]
    sample_value_list = [result_entry[1] for result_entry in results]
    return jsonify([{"otu_ids": otu_id_list, "sample_values": sample_value_list}])


if __name__ == "__main__":
    app.run(debug=True)

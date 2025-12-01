from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SECRET_KEY'] = 'super-secret-key-123'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///security_dashboard.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'super-jwt-secret-456'

CORS(app)
db = SQLAlchemy(app)
jwt = JWTManager(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

class Scan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    target_url = db.Column(db.String(500), nullable=False)
    tool = db.Column(db.String(50), default="mock")
    status = db.Column(db.String(50), default="completed")
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class Finding(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    scan_id = db.Column(db.Integer, db.ForeignKey('scan.id'))
    type = db.Column(db.String(100))
    severity = db.Column(db.String(20))
    description = db.Column(db.Text)

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Email and password required"}), 400

    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password_hash, password):
        token = create_access_token(identity=str(user.id))
        return jsonify({"access_token": token}), 200

    return jsonify({"msg": "Invalid credentials"}), 401




@app.route("/api/auth/me")
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    return jsonify({"user": {"id": user.id, "email": user.email}})

@app.route("/api/scans", methods=["POST"])
@jwt_required()
def create_scan():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    scan = Scan(
        target_url=data["target_url"],
        tool=data.get("tool", "mock"),
        status="completed",
        user_id=user_id,
    )
    db.session.add(scan)
    db.session.commit()
    
    f1 = Finding(scan_id=scan.id, type="SQL Injection", severity="High", 
                description=f"SQLi found on {data['target_url']}/login")
    f2 = Finding(scan_id=scan.id, type="XSS", severity="Medium", 
                description=f"XSS found on {data['target_url']}/search")
    db.session.add(f1)
    db.session.add(f2)
    db.session.commit()
    
    return jsonify({"id": scan.id}), 201

@app.route("/api/scans")
@jwt_required()
def list_scans():
    user_id = get_jwt_identity()
    scans = Scan.query.filter_by(user_id=user_id).all()
    return jsonify([{
        "id": s.id, 
        "target_url": s.target_url, 
        "tool": s.tool, 
        "status": s.status
    } for s in scans])

@app.route("/api/findings/<int:scan_id>")
@jwt_required()
def get_findings(scan_id):
    findings = Finding.query.filter_by(scan_id=scan_id).all()
    return jsonify([{
        "id": f.id,
        "type": f.type, 
        "severity": f.severity, 
        "description": f.description
    } for f in findings])

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        if not User.query.filter_by(email="admin@example.com").first():
            user = User(email="admin@example.com")
            user.password_hash = generate_password_hash("password123")
            db.session.add(user)
            db.session.commit()
            print("✅ Demo user created!")
    print("🚀 Backend running!")
    app.run(host="0.0.0.0", port=5000, debug=True)

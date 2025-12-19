import os
from flask import Flask, render_template, request, jsonify, url_for,session,send_from_directory,redirect
from groq import Groq
import sqlite3

from db import init_db
from werkzeug.security import generate_password_hash, check_password_hash

from db import get_db

app = Flask(__name__)
app.secret_key = "studyhub-secret-key"

EVENTS = []

#------------
DB_NAME = "study_portal.db"
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ---------------- DB ----------------
def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()

    # Users
    cur.execute("""CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT CHECK(role IN ('admin','student')) DEFAULT 'student'
    )""")

    # Batches
    cur.execute("""CREATE TABLE IF NOT EXISTS batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
    )""")

    # Subjects
    cur.execute("""CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_id INTEGER,
        degree TEXT,
        year INTEGER,
        semester INTEGER,
        name TEXT,
        FOREIGN KEY(batch_id) REFERENCES batches(id)
    )""")

    # Materials
    cur.execute("""CREATE TABLE IF NOT EXISTS materials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id INTEGER,
        title TEXT,
        file_path TEXT,
        FOREIGN KEY(subject_id) REFERENCES subjects(id)
    )""")

    # ✅ Insert default admin
    cur.execute("SELECT * FROM users WHERE username=?", ("admin",))
    if not cur.fetchone():
        hashed_pw = generate_password_hash("admin123")
        cur.execute("INSERT INTO users (username,email,password,role) VALUES (?,?,?,?)",
                    ("admin","admin@gmail.com",hashed_pw,"admin"))
        print("✅ Default admin created (username=admin, password=admin123)")

    conn.commit()
    conn.close()


#==============
# 🔑 YOUR GROQ API KEY
client = Groq(api_key="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")

@app.route("/chatbot")
def chatbot_page():
    return render_template("chat.html")

@app.route("/ask", methods=["POST"])
def ask_ai():
    data = request.json
    user_question = data.get("question")

    if not user_question:
        return jsonify({"answer": "Please ask a question"})

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",   # ✅ UPDATED MODEL
            messages=[
                {
                    "role": "system",
                    "content": "You are a friendly and clear teacher. Explain answers in simple student-friendly language."
                },
                {
                    "role": "user",
                    "content": user_question
                }
            ]
        )

        answer = response.choices[0].message.content
        return jsonify({"answer": answer})

    except Exception as e:
        return jsonify({"answer": "Error: " + str(e)})

#==============
@app.route("/")
def landing():
    return render_template("landing.html")

@app.route("/login", methods=["GET"])
def login_page():
    return render_template("login.html")

@app.route("/login", methods=["POST"])
def login_post():
    data = request.get_json()
    username = data["username"]
    password = data["password"]

    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cur.fetchone()
    conn.close()

    if user and check_password_hash(user["password"], password):
        session["user_id"] = user["id"]
        session["role"] = user["role"]
      
        return jsonify({
            "status": "success",
            "redirect": url_for("home") #main
            })

    return jsonify({
        "status": "error",
        "message": "Invalid credentials"
    })

'''
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    username = data["username"]
    email = data["email"].strip()
    password = generate_password_hash(data["password"])

    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            (username, email, password, "student")
        )
        conn.commit()
    except sqlite3.IntegrityError as e:
        if "username" in str(e).lower():
            msg = "Username already exists"
        elif "email" in str(e).lower():
            msg = "Email already exists"
        else:
            msg = "Account already exists"

        return jsonify({
            "status": "error",
            "message": msg
        })
    finally:
        conn.close()

    return jsonify({
        "status": "success",
        "redirect": url_for("main")
    })
'''

@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    username = data["username"]
    email = data["email"]
    password = generate_password_hash(data["password"])

    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            (username, email, password)
        )
        conn.commit()
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "User already exists"
        })
    finally:
        conn.close()

    return jsonify({
        "status": "success",
        "redirect": url_for("main")
    })


@app.route("/logout")
def logout():
    session.clear()   # 🔑 removes user_id, role, username, email
    return redirect(url_for("login_page"))

@app.route("/save-department", methods=["POST"])
def save_department():
    data = request.get_json()
    department = data["department"]

    # TEMP: assign to last user (we'll fix with sessions next)
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT id FROM users ORDER BY id DESC LIMIT 1")
    user_id = cur.fetchone()["id"]

    cur.execute(
        "INSERT INTO user_department (user_id, department) VALUES (?, ?)",
        (user_id, department)
    )

    conn.commit()
    conn.close()
    return "", 204

@app.route("/register")
def register_page():
    return render_template("register.html")


@app.route("/main")
def main():
    if session.get("role") != "student":
        return redirect(url_for("home"))
    
    return render_template("main.html")

@app.route("/department")
def department():
    return render_template("dept.html")

@app.route("/home")
def home():
     if "user_id" not in session:
        return redirect(url_for("login_page"))
     
     return render_template(
        "home.html",
        username=session.get("username"),
        email=session.get("email")
    )


@app.route("/previous-papers")
def previous_papers():
    return render_template("previous_papers.html")

@app.route("/chatbot")
def chatbot():
    return render_template("chat.html")


#FOR EVENTS AND ANNOUNCEMENTS

@app.route("/events", methods=["GET", "POST"])
def events_page():
    role = session.get("role")

    # ---------- ADMIN ----------
    if role == "admin":
        if request.method == "POST":
            event_id = request.form.get("event_id")

            if event_id:
                for e in EVENTS:
                    if e["id"] == int(event_id):
                        e["title"] = request.form["title"]
                        e["description"] = request.form["description"]
                        e["category"] = request.form["category"]
                        e["date"] = request.form["date"]
                        break
            else:
                EVENTS.append({
                    "id": len(EVENTS) + 1,
                    "title": request.form["title"],
                    "description": request.form["description"],
                    "category": request.form["category"],
                    "date": request.form["date"]
                })

        return render_template("admin_events.html", events=EVENTS)

    # ---------- STUDENT ----------
    return render_template("events.html", events=EVENTS)



#----------batches------
# ---------------- FLOW ----------------
@app.route("/batch", methods=["GET","POST"])
def batch():
    conn = get_db()
    cur = conn.cursor()
    if request.method == "POST" and session.get("role") == "admin":
        name = request.form["batch_name"]   # FIXED
        cur.execute("INSERT INTO batches(name) VALUES(?)", (name,))
        conn.commit()
    cur.execute("SELECT * FROM batches")
    batches = cur.fetchall()
    return render_template("batch.html", batches=batches)

@app.route("/delete_batch/<int:batch_id>", methods=["POST"])
def delete_batch(batch_id):
    if session.get("role") != "admin":
        return "Unauthorized", 403
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM batches WHERE id=?", (batch_id,))
    conn.commit()
    conn.close()
    return "Deleted", 200

@app.route("/edit_batch/<int:batch_id>", methods=["POST"])
def edit_batch(batch_id):
    if session.get("role") != "admin":
        return "Unauthorized", 403
    data = request.get_json()
    new_name = data.get("name", "").strip()
    if not new_name:
        return "Invalid name", 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute("UPDATE batches SET name=? WHERE id=?", (new_name, batch_id))
    conn.commit()
    conn.close()
    return "Updated", 200




@app.route("/course/<int:batch_id>", methods=["GET","POST"])
def course(batch_id):
    if request.method=="POST":
        degree = request.form["degree"]
        year = request.form["year"]
        sem = request.form["semester"]
        return redirect(url_for("subjects",batch_id=batch_id,degree=degree,year=year,sem=sem))
    return render_template("course.html", batch_id=batch_id)

@app.route("/subjects/<int:batch_id>/<degree>/<year>/<sem>")
def subjects(batch_id,degree,year,sem):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM subjects WHERE batch_id=? AND degree=? AND year=? AND semester=?",
                (batch_id,degree,year,sem))
    subjects = cur.fetchall()
    return render_template("subject.html",subjects=subjects,batch_id=batch_id,degree=degree,year=year,sem=sem)

@app.route("/add_subject", methods=["POST"])
def add_subject():
    if session.get("role") != "admin":
        return "Unauthorized", 403

    # safely get form data
    batch_id = int(request.form["batch"])
    degree = request.form["degree"]
    year = int(request.form["year"])
    sem = int(request.form["sem"])
    subject_name = request.form["subject_name"].strip()

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO subjects (batch_id, degree, year, semester, name) VALUES (?,?,?,?,?)",
        (batch_id, degree, year, sem, subject_name)
    )
    conn.commit()
    conn.close()

    return redirect(url_for("subjects", batch_id=batch_id, degree=degree, year=year, sem=sem))

@app.route("/delete_subject/<int:subject_id>", methods=["POST"])
def delete_subject(subject_id):
    if session.get("role") != "admin":
        return "Unauthorized", 403

    conn = get_db()
    cur = conn.cursor()
    # delete subject by id
    cur.execute("DELETE FROM subjects WHERE id = ?", (subject_id,))
    conn.commit()
    conn.close()

    # After delete go back to subjects page
    # we need batch_id, degree, year, sem to redirect properly
    return redirect(request.referrer or url_for("dashboard"))


@app.route("/edit_subject/<int:subject_id>", methods=["POST"])
def edit_subject(subject_id):
    if session.get("role") != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    new_name = data.get("name", "").strip()
    if not new_name:
        return jsonify({"error": "Invalid name"}), 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute("UPDATE subjects SET name=? WHERE id=?", (new_name, subject_id))
    conn.commit()
    conn.close()

    return jsonify({"success": True})

@app.route("/materials/<int:subject_id>")
def materials(subject_id):
    conn = get_db()
    cur = conn.cursor()

    # Subject details fetch
    cur.execute("SELECT * FROM subjects WHERE id=?", (subject_id,))
    subject = cur.fetchone()

    # Materials fetch
    cur.execute("SELECT * FROM materials WHERE subject_id=?", (subject_id,))
    mats = cur.fetchall()

    conn.close()
    return render_template("material.html", notes=mats, subject=subject)

# ---------------- FILES ----------------
@app.route("/upload/<int:subject_id>", methods=["POST"])
def upload_material(subject_id):
    if "file" not in request.files:
        return "No file"
    file = request.files["file"]
    if file.filename == "":
        return "Empty filename"

    title = request.form["title"]
    path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(path)

    conn = get_db()
    cur = conn.cursor()
    cur.execute("INSERT INTO materials(subject_id,title,file_path) VALUES (?,?,?)",
                (subject_id, title, path))
    conn.commit()
    conn.close()

    return redirect(url_for("materials", subject_id=subject_id))



@app.route("/edit_material/<int:mat_id>", methods=["POST"])
def edit_material(mat_id):
    if session.get("role") != "admin":
        return "Unauthorized", 403
    data = request.get_json()
    new_title = data.get("title", "").strip()
    if not new_title:
        return "Invalid title", 400
    conn = get_db()
    cur = conn.cursor()
    cur.execute("UPDATE materials SET title=? WHERE id=?", (new_title, mat_id))
    conn.commit()
    conn.close()
    return "Updated", 200

@app.route("/delete_material/<int:mat_id>", methods=["POST"])
def delete_material(mat_id):
    if session.get("role") != "admin":
        return "Unauthorized", 403

    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM materials WHERE id=?", (mat_id,))
    conn.commit()
    conn.close()

    # redirect back to materials page
    return redirect(request.referrer or url_for("main"))


@app.route("/download/<int:mat_id>")
def download(mat_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM materials WHERE id=?",(mat_id,))
    mat = cur.fetchone()
    if mat:
        return send_from_directory(UPLOAD_FOLDER,os.path.basename(mat["file_path"]),as_attachment=True)
    return "Not found"

#-------end--------






init_db()

if __name__ == "__main__":
    app.run(debug=True)








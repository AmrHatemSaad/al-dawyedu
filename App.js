import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialAccessCodes = ["ABC123", "HIST456", "ENG789"];
const adminPhone = "01211515336";
const teacherPhones = {
  Arabic: "01288217997",
  English: "01211738675",
  History: "01119020980"
};
const adminPassword = "reem20100";

export default function AlDawyeduApp() {
  const [view, setView] = useState("login");
  const [lang, setLang] = useState("en");
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    guardianPhone: "",
    fullName: "",
    password: ""
  });
  const [user, setUser] = useState(null);
  const [code, setCode] = useState("");
  const [unlockedSubjects, setUnlockedSubjects] = useState([]);
  const [accessCodes, setAccessCodes] = useState(initialAccessCodes);
  const [newCode, setNewCode] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = () => {
    localStorage.setItem(formData.phone, JSON.stringify(formData));
    alert("Account created successfully!");
    setView("login");
  };

  const handleLogin = () => {
    const saved = localStorage.getItem(formData.phone);
    if (saved) {
      const userData = JSON.parse(saved);
      if (userData.password === formData.password) {
        setUser(userData);
        if (formData.phone === adminPhone) setView("admin");
        else if (Object.values(teacherPhones).includes(formData.phone)) setView("teacher");
        else setView("dashboard");
      } else alert("Incorrect password");
    } else alert("User not found");
  };

  const handleCodeSubmit = () => {
    if (accessCodes.includes(code)) {
      setUnlockedSubjects([...unlockedSubjects, code]);
      alert("Lecture unlocked!");
      setCode("");
    } else {
      alert("Invalid code");
    }
  };

  const handleAddCode = () => {
    if (!accessCodes.includes(newCode) && newCode.trim() !== "") {
      setAccessCodes([...accessCodes, newCode]);
      setNewCode("");
    }
  };

  const handleFileUpload = (e, subject) => {
    const file = e.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setUploadedFiles({ ...uploadedFiles, [subject]: [...(uploadedFiles[subject] || []), { name: file.name, url: fileURL }] });
    }
  };

  const exportCSV = () => {
    let csv = "Full Name,Email,Phone,Guardian Phone\n";
    Object.keys(localStorage).forEach(key => {
      const u = JSON.parse(localStorage.getItem(key));
      if (u && u.fullName && u.phone) {
        csv += `${u.fullName},${u.email},${u.phone},${u.guardianPhone}\n`;
      }
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    a.click();
  };

  if (view === "login") {
    return (
      <div className="p-4 max-w-md mx-auto space-y-3">
        <h2 className="text-xl font-bold">Login</h2>
        <Input name="phone" placeholder="Phone Number" onChange={handleChange} />
        <Input name="password" type="password" placeholder="Password" onChange={handleChange} />
        <Button onClick={handleLogin}>Login</Button>
        <Button variant="link" onClick={() => setView("register")}>Create Account</Button>
      </div>
    );
  }

  if (view === "register") {
    return (
      <div className="p-4 max-w-md mx-auto space-y-3">
        <h2 className="text-xl font-bold">Register</h2>
        <Input name="email" placeholder="Email" onChange={handleChange} />
        <Input name="phone" placeholder="Phone Number" onChange={handleChange} />
        <Input name="guardianPhone" placeholder="Guardian Phone" onChange={handleChange} />
        <Input name="fullName" placeholder="Full Name" onChange={handleChange} />
        <Input name="password" type="password" placeholder="Password" onChange={handleChange} />
        <Button onClick={handleRegister}>Create</Button>
        <Button variant="link" onClick={() => setView("login")}>Back to Login</Button>
      </div>
    );
  }

  if (view === "admin") {
    return (
      <div className="p-4 space-y-4 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <div>
          <h3 className="font-semibold">Add Access Code</h3>
          <Input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="New Access Code" />
          <Button onClick={handleAddCode}>Add</Button>
        </div>
        <div>
          <h3 className="font-semibold">All Access Codes</h3>
          <ul>{accessCodes.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </div>
        <div>
          <Button onClick={exportCSV}>Export Student Data (CSV)</Button>
        </div>
      </div>
    );
  }

  if (view === "teacher") {
    return (
      <div className="p-4 max-w-2xl mx-auto space-y-6">
        <h2 className="text-xl font-bold">Teacher Panel</h2>
        {Object.keys(teacherPhones).map((subject) => (
          teacherPhones[subject] === user.phone && (
            <div key={subject}>
              <h3 className="font-semibold">Upload for {subject}</h3>
              <Input type="file" onChange={(e) => handleFileUpload(e, subject)} />
              <ul className="mt-2 space-y-1">
                {(uploadedFiles[subject] || []).map((f, i) => (
                  <li key={i}><a className="text-blue-600 underline" href={f.url} target="_blank" rel="noreferrer">{f.name}</a></li>
                ))}
              </ul>
            </div>
          )
        ))}
      </div>
    );
  }

  if (view === "dashboard") {
    return (
      <div className="p-4 max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold">Welcome {user.fullName}</h2>
        <Input placeholder="Enter Access Code" value={code} onChange={(e) => setCode(e.target.value)} />
        <Button onClick={handleCodeSubmit}>Unlock</Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(teacherPhones).map(subject => (
            <div key={subject} className="p-4 border rounded-xl shadow bg-gray-50">
              <h3 className="text-lg font-semibold">{subject}</h3>
              {(uploadedFiles[subject] && accessCodes.some(code => unlockedSubjects.includes(code))) ? (
                <ul className="mt-2 space-y-1">
                  {uploadedFiles[subject].map((f, i) => (
                    <li key={i}><a className="text-blue-600 underline" href={f.url} target="_blank" rel="noreferrer">{f.name}</a></li>
                  ))}
                </ul>
              ) : <p className="text-sm text-gray-600">Locked or no files</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

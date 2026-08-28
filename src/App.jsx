import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Landing from "./routes/Landing";
import TeacherCreate from "./routes/TeacherCreate";
import TeacherDashboard from "./routes/TeacherDashboard";
import TeacherCompareFullscreen from "./routes/TeacherCompareFullscreen";
import StudentJoin from "./routes/StudentJoin";
import StudentPlay from "./routes/StudentPlay";
import StudentPreview from "./routes/StudentPreview";
import PrivacyPolicy from "./routes/PrivacyPolicy";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/teacher/new" element={<TeacherCreate />} />
        <Route path="/teacher/:pin" element={<TeacherDashboard />} />
        <Route path="/teacher/:pin/compare" element={<TeacherCompareFullscreen />} />
        <Route path="/teacher/:pin/preview" element={<StudentPreview />} />
        <Route path="/join" element={<StudentJoin />} />
        <Route path="/play/:pin" element={<StudentPlay />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

import { useParams } from "react-router-dom";
import API from "../services/api";

function AcceptInvite() {
  const { token } = useParams();

  const accept = async () => {
    try {
      await API.get(`/org/accept-invite/${token}`);
      alert("Joined successfully ✅");
      window.location.href = "/dashboard";
    } catch (error) {
      alert("Invalid invite ❌");
    }
  };
  if (!req.user) {
  return res.status(401).send("Login required ❌");
}
if (!localStorage.getItem("token")) {
  window.location.href = "/";
}
  return (
    <div className="h-screen flex items-center justify-center">
      <button
        onClick={accept}
        className="bg-green-500 text-white px-6 py-3 rounded"
      >
        Accept Invitation
      </button>
    </div>
  );
}

export default AcceptInvite;
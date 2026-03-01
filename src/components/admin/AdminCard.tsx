import React from "react";

interface AdminCardProps {
  icon: React.ReactNode;
  title: string;
  colorClass: string;
  children: React.ReactNode;
  buttonText: string;
  onButtonClick: () => void;
  gradient: string;
}

const AdminCard: React.FC<AdminCardProps> = ({
  icon,
  title,
  colorClass,
  children,
  buttonText,
  onButtonClick,
  gradient,
}) => (
  <div
    className={`relative group bg-white bg-opacity-90 rounded-2xl shadow-xl p-8 flex flex-col gap-4 border border-gray-100 overflow-hidden hover:scale-[1.03] hover:shadow-2xl transition-transform duration-200`}
  >
    <div
      className={`absolute -top-8 -right-8 opacity-10 ${colorClass} text-[7rem] pointer-events-none select-none`}
    >
      {icon}
    </div>
    <h3 className={`text-xl font-bold ${colorClass}`}>{title}</h3>
    <div className="ml-4 text-gray-700 text-sm space-y-1 list-disc">
      {children}
    </div>
    <button
      className={`mt-2 px-4 py-2 ${gradient} text-white rounded-lg hover:opacity-90 transition w-full font-semibold shadow`}
      onClick={onButtonClick}
    >
      {buttonText}
    </button>
  </div>
);

export default AdminCard;

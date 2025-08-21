type StatusBarProps = {
  isOnline: boolean;
};

function StatusBar({ isOnline }: StatusBarProps) {
  return (
    <div className={`status-bar ${isOnline ? "online" : "offline"}`}>
      {isOnline ? (
        <>
          <span className="pulse"></span> Online
        </>
      ) : (
        <>
          <span className="mr-2"></span> Offline
        </>
      )}
    </div>
  );
}

export default StatusBar;

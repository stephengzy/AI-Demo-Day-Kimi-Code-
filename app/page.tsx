export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            color: "#333",
            marginBottom: "16px",
            fontWeight: 500,
          }}
        >
          网站已下线
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "#666",
            margin: 0,
          }}
        >
          如需了解请联系恒宇
        </p>
      </div>
    </main>
  );
}

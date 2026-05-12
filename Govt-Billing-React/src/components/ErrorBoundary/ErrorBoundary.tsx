import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            padding: "20px",
            textAlign: "center",
            backgroundColor: "#f8f9fa",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "40px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                fontSize: "64px",
                marginBottom: "20px",
              }}
            >
              ⚠️
            </div>
            <h1
              style={{
                color: "#dc3545",
                fontSize: "24px",
                marginBottom: "16px",
                fontWeight: 600,
              }}
            >
              Something Went Wrong
            </h1>
            <p
              style={{
                color: "#6c757d",
                fontSize: "16px",
                lineHeight: "1.5",
                marginBottom: "24px",
              }}
            >
              The application encountered an unexpected error. Don't worry, your
              data is safe.
            </p>
            {this.state.error && (
              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #dee2e6",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "24px",
                  textAlign: "left",
                  overflow: "auto",
                }}
              >
                <p
                  style={{
                    color: "#dc3545",
                    fontFamily: "monospace",
                    fontSize: "14px",
                    margin: 0,
                    wordBreak: "break-word",
                  }}
                >
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={this.handleReload}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#0056b3")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#007bff")
                }
              >
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#6c757d",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#545b62")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#6c757d")
                }
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

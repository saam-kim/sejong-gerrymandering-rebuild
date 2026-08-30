import { Component } from "react";

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error("화면을 표시하는 중 오류가 발생했습니다.", error, info);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6 text-center">
        <div className="max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-xl font-black text-gray-900">화면을 다시 불러와야 합니다</h1>
          <p className="mt-2 text-sm font-bold leading-6 text-gray-600">
            임시 화면 오류가 발생했습니다. 자동 저장된 내용은 실시간 서버에 남아 있으므로 새로고침해 주세요.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 font-black text-white"
          >
            새로고침
          </button>
        </div>
      </main>
    );
  }
}

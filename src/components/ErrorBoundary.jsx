import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: (error && error.message) || String(error) };
  }

  retry = () => this.setState({ hasError: false, message: '' });

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC] p-6">
          <div className="max-w-md w-full bg-white border border-[#E4E7EC] rounded-2xl shadow-sm p-8 text-center">
            <div className="w-11 h-11 mx-auto rounded-xl bg-[#FFF4EC] flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#F97316]" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
              </svg>
            </div>
            <h1 className="text-[16px] font-bold text-[#111827]">Có lỗi khi hiển thị trang</h1>
            <p className="text-[12.5px] text-[#667085] mt-2 leading-relaxed">
              Hệ thống không hiển thị được nội dung này. Dữ liệu demo của bạn vẫn được giữ nguyên.
            </p>
            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                onClick={this.retry}
                className="px-4 h-10 rounded-xl bg-[#253B80] text-white text-[12.5px] font-semibold hover:bg-[#1D2F66] transition-colors"
              >
                Thử lại
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 h-10 rounded-xl border border-[#E4E7EC] text-[#344054] text-[12.5px] font-semibold hover:bg-[#F7F8FC] transition-colors"
              >
                Tải lại trang
              </button>
            </div>
            <p className="mt-4 text-[10.5px] text-[#98A2B3] break-words">{this.state.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
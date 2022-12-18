import { Toaster, ToastBar, toast } from 'react-hot-toast';

const ToastContainer = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={10}
      containerClassName=""
      containerStyle={{
        top: 20,
        left: 20,
        bottom: 20,
        right: 20
      }}
      toastOptions={{
        // Define default options
        className: '',
        duration: 5000,
        style: {
          background: '#fafafa',
          color: '#111',
          padding: '16px'
        },
        // Default options for specific types
        loading: {
          duration: 60000,
          theme: {
            primary: 'black',
            secondary: 'black'
          }
        },
        // Default options for specific types
        success: {
          duration: 5000,
          theme: {
            primary: 'green',
            secondary: 'black'
          }
        }
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <>
              {icon}
              {message}
              {t.type !== 'loading' && (
                <button
                  onClick={() => toast.dismiss(t.id)}
                  style={{ border: 'none', background: 'transparent' }}
                >
                  &#10006;
                </button>
              )}
            </>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
};

export default ToastContainer;

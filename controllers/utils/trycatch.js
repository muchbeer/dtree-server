const tryCatch = (controller) => {
    return async (req, res) => {
      try {
        await controller(req, res);
      } catch (error) {
        res.status(500).json({ success: false, message: 'Please check your network and try again',
        });
      }
    };
  };
  
  //
  export default tryCatch;
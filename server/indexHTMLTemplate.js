module.exports = function(imagesServiceData) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <title>A PetToyCo proxy server</title>
    </head>
    <body >
      <div
        id="MODAL_ATTACH_POINT"
        style="position: absolute; top: -20px; left: -20px; visibility: hidden; overflow: hidden; background-color: rgba(0, 0, 0, 0.4); z-index: 100;"
      ></div>
      <div style="display: flex;">
        <div style="width: 21.3%; margin-right: 9px;"> </div>
        <div style="display: flex; flex-direction: column">
          <div style="display: flex; margin: 0 0 20px 0;">
            <div id="gallery">
              ${imagesServiceData}
            </div>
            <div id="mainTitleMount"></div>
            <div id="itemAvailability">
            </div>
          </div>
          <div id="RECOMMENDATIONS_CUSTOMER_ATTACH_POINT"></div>
          <div id="RECOMMENDATIONS_TREAT_ATTACH_POINT"></div>
          <div id="description" style="margin: 0 0 20px 0;">
          </div>
          <div id="REVIEWS_ATTACH_POINT"></div>
          <div id="RECOMMENDATIONS_PET_ATTACH_POINT"></div>
        </div>
        <div style="width: 21.3%;"></div>
    </body>

    <script>
      const callback = function() {
        const body = document.body;

        let height = body.scrollHeight + 40;
        let width = body.scrollWidth + 40;

        const modalAttachPoint = document.getElementById("MODAL_ATTACH_POINT");

        modalAttachPoint.style.height = \`\${height}px\`;
        modalAttachPoint.style.width = \`\${width}px\`;
      };

      window.addEventListener('resize', callback);

      const targetNode = document.body;
      const observer = new MutationObserver(callback);
      const config = { childList: true, subtree: true, attributes: false };
      observer.observe(targetNode, config);
    </script>

    <script crossorigin src="https://unpkg.com/react@16/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@16/umd/react-dom.production.min.js"></script>
    <script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.2/axios.min.js"></script>
    <script crossorigin src="https://momentjs.com/downloads/moment.min.js"></script>
    <script src="/imagesBundle.js"></script>
  </html>
  `;
};

// module.exports = function(imagesServiceData, delPickupServiceData, descriptionServiceData) {
//   return `
//   <!DOCTYPE html>
//   <html>
//     <head>
//       <title>A PetToyCo proxy server</title>
//     </head>
//     <body >
//       <div
//         id="MODAL_ATTACH_POINT"
//         style="position: absolute; top: -20px; left: -20px; visibility: hidden; overflow: hidden; background-color: rgba(0, 0, 0, 0.4); z-index: 100;"
//       ></div>
//       <div style="display: flex;">
//         <div style="width: 21.3%; margin-right: 9px;"> </div>
//         <div style="display: flex; flex-direction: column">
//           <div style="display: flex; margin: 0 0 20px 0;">
//             <div id="gallery">
//               ${imagesServiceData}
//             </div>
//             <div id="mainTitleMount"></div>
//             <div id="itemAvailability">
//               ${delPickupServiceData}
//             </div>
//           </div>
//           <div id="RECOMMENDATIONS_CUSTOMER_ATTACH_POINT"></div>
//           <div id="RECOMMENDATIONS_TREAT_ATTACH_POINT"></div>
//           <div id="description" style="margin: 0 0 20px 0;">
//             ${descriptionServiceData}
//           </div>
//           <div id="REVIEWS_ATTACH_POINT"></div>
//           <div id="RECOMMENDATIONS_PET_ATTACH_POINT"></div>
//         </div>
//         <div style="width: 21.3%;"></div>
//     </body>

//     <script>
//       const callback = function() {
//         const body = document.body;

//         let height = body.scrollHeight + 40;
//         let width = body.scrollWidth + 40;

//         const modalAttachPoint = document.getElementById("MODAL_ATTACH_POINT");

//         modalAttachPoint.style.height = \`\${height}px\`;
//         modalAttachPoint.style.width = \`\${width}px\`;
//       };

//       window.addEventListener('resize', callback);

//       const targetNode = document.body;
//       const observer = new MutationObserver(callback);
//       const config = { childList: true, subtree: true, attributes: false };
//       observer.observe(targetNode, config);
//     </script>

//     <script crossorigin src="https://unpkg.com/react@16/umd/react.production.min.js"></script>
//     <script crossorigin src="https://unpkg.com/react-dom@16/umd/react-dom.production.min.js"></script>
//     <script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.2/axios.min.js"></script>
//     <script crossorigin src="https://momentjs.com/downloads/moment.min.js"></script>
//     <script src="/imagesBundle.js"></script>
//     <script src="/delPickupBundle.js"></script>
//     <script src="/descriptionBundle.js"></script>
//   </html>
//   `;
// };

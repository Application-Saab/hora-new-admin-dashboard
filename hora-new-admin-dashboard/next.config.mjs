// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;

// next.config.js
// export default {
//     images: {
//       domains: ['horaservices.com'],
//     },
//     output: 'export',
//   };
  

/** @type {import('next').NextConfig} */
const nextConfig = {
  images:{
      unoptimized:true
    },
  output: "export",
  // trailingSlash: true,
  webpack(config) {
      config.module.rules.push({
          test: /\.(mp4|webm|ogg|swf|ogv)$/,
          use: {
              loader: 'file-loader',
              options: {
                  publicPath: '/_next/static/videos/',
                  outputPath: 'static/videos/',
                  name: '[name].[hash].[ext]',
              },
          },
      });

      return config;
  }
};

export default nextConfig;

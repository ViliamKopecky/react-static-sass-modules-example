import axios from 'axios'
import path from 'path'

// Paths Aliases defined through tsconfig.json
const typescriptWebpackPaths = require('./webpack.config.js')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

export default {
  entry: path.join(__dirname, 'src', 'index.tsx'),
  getSiteData: () => ({
    title: 'React Static',
  }),
  getRoutes: async () => {
    const { data: posts } = await axios.get(
      'https://jsonplaceholder.typicode.com/posts',
    )
    return [
      {
        path: '/',
        component: 'src/containers/Home',
      },
      {
        path: '/about',
        component: 'src/containers/About',
      },
      {
        path: '/blog',
        component: 'src/containers/Blog',
        getData: () => ({
          posts,
        }),
        children: posts.map(post => ({
          path: `/post/${post.id}`,
          component: 'src/containers/Post',
          getData: () => ({
            post,
          }),
        })),
      },
      {
        is404: true,
        component: 'src/containers/404',
      },
    ]
  },
  webpack: (config, { defaultLoaders, stage }) => {
    config.resolve.extensions.push('.ts', '.tsx', '.sass', '.scss')

    config.resolve.alias = typescriptWebpackPaths.resolve.alias

    config.module.rules = [
      {
        oneOf: [
          {
            test: /\.(js|jsx|ts|tsx)$/,
            exclude: defaultLoaders.jsLoader.exclude, // as std jsLoader exclude
            use: [
              {
                loader: 'babel-loader',
              },
              {
                loader: require.resolve('ts-loader'),
                options: {
                  transpileOnly: true,
                },
              },
            ],
          },
          {
            test: /\.module\.s(a|c)ss$/,
            use:
              stage === 'dev'
                ? [
                    {
                      loader: 'style-loader',
                    },
                    {
                      loader: 'typings-for-css-modules-loader',
                      options: {
                        modules: true,
                        localIdentName: '[name]__[local]--[hash:base64:5]',
                        sourceMap: true,
                        namedExport: true,
                        camelCase: true,
                        minimize: false,
                        importLoaders: 2,
                      },
                    },
                    'postcss-loader',
                    {
                      loader: 'sass-loader',
                      options: { includePaths: ['src/'] },
                    },
                  ]
                : ExtractTextPlugin.extract({
                    use: [
                      {
                        loader: 'typings-for-css-modules-loader',
                        options: {
                          importLoaders: 2,
                          minimize: true,
                          sourceMap: process.env.REACT_STATIC_DEBUG,
                          modules: true,
                          localIdentName: process.env.REACT_STATIC_DEBUG
                            ? '[name]__[local]--[hash:base64:5]'
                            : undefined,
                        },
                      },
                      'postcss-loader',
                      {
                        loader: 'sass-loader',
                        options: { includePaths: ['src/'] },
                      },
                    ],
                  }),
          },
          {
            test: /\.s(a|c)ss$/,
            exclude: /\.module\.s(a|c)ss$/,
            use:
              stage === 'dev'
                ? [
                    {
                      loader: 'style-loader',
                    },
                    {
                      loader: 'css-loader',
                      options: {
                        sourceMap: true,
                        minimize: false,
                      },
                    },
                    'postcss-loader',
                    { loader: 'sass-loader' },
                  ]
                : ExtractTextPlugin.extract({
                    use: [
                      {
                        loader: 'css-loader',
                        options: {
                          importLoaders: 2,
                          minimize: true,
                          sourceMap: process.env.REACT_STATIC_DEBUG,
                          localIdentName: process.env.REACT_STATIC_DEBUG
                            ? '[name]__[local]--[hash:base64:5]'
                            : undefined,
                        },
                      },
                      'postcss-loader',
                      {
                        loader: 'sass-loader',
                        options: { includePaths: ['src/'] },
                      },
                    ],
                  }),
          },
          defaultLoaders.cssLoader,
          defaultLoaders.jsLoader,
          defaultLoaders.fileLoader,
        ],
      },
    ]
    return config
  },
}

# 🕹️ LGGL
**L**oren **G**oodwin's **G**ame **L**auncher: A cross-platform Node.js based game launcher.

I made this to have an alternative to [Playnite](https://playnite.link/) for my upcoming switch to Linux on my main computer. I also wanted various categorization features that were lacking in Playnite (which is saying a lot, because it's great!).

This is not really ready for anyone but me to use, so probably use Playnite if you've come across this somehow but if you're still interested for some reason, maybe the sections below will help you out.

## Prerequisites
You will need **Node.js 22.12.0 or higher** installed. It might work in earlier versions, but I haven't tested it nor do I intend to.

## Usage
Here is a possibly incomplete list of steps to get this running on your machine:

1. Clone the repository
2. Add an `.env` file in the root directory or a `lggl.env` file in your home directory
3. Add values conforming to the schemas defined in `src/env` to the file
4. Run `npm install` in the root directory
5. Run `npx prisma generate` in the root directory
6. Run `npm run build` in the root directory
7. Run `node ./build/server.js` in the root directory
8. Go to `localhost:8008` or whatever port you specified in the `LGGL_PORT` environment variable
9. Realise you need to manually add most data to the database at the moment and give up?

I'll probably include a setup script to do most of this for you, at some point, but given that the UI can't manage data really at the moment it's not a priority.

## License
[MIT](https://github.com/duckdotapk/lggl/blob/main/LICENSE.md)
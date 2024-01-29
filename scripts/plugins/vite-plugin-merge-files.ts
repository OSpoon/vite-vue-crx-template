import path from "node:path";
import fs from "fs-extra";

import { Plugin } from "vite";

import { CRX_OUTDIR } from "../../global.config";

export const mergeFiles = (options: {
  root: string;
  files: string[];
  callback: () => void;
}): Plugin => {
  const { root, files, callback } = options;

  return {
    name: "vite-plugin-merge-files",
    apply: "build",
    async closeBundle() {
      for (const filename of files) {
        await fs.copyFileSync(
          path.resolve(process.cwd(), `${root}/${filename}`),
          path.resolve(process.cwd(), `${CRX_OUTDIR}/${filename}`),
          fs.constants.COPYFILE_FICLONE
        );
      }
      await fs.removeSync(path.resolve(process.cwd(), root));
      callback();
    },
  };
};

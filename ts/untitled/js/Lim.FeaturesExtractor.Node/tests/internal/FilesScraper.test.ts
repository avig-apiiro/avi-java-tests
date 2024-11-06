import {expect} from "chai";
import 'mocha';
import {scrapeFilesAsync} from "../../src/internals/FilesScraper";
import {Context} from "../../src/types/Context";

describe('Test Files Scraper', () => {
    let scrapedFiles: string[] = [];
    before(async () => {
        const testContext = new Context("TEST", "tests/projects/TsProject");
        scrapedFiles = await scrapeFilesAsync(testContext);
    });

    it('Node modules directories are skipped', () => {
        expect(hasFileWithPrefix("node_modules")).to.be.false;
    });

    it('.npm directory is skipped', () => {
        expect(hasFileWithPrefix(".npm")).to.be.false;
    });

    it('.min.js skipped', () => {
        expect(hasFileWithSuffix(".min.js")).to.be.false;
    });

    it('App not skipped', () => {
        expect(hasFileWithSuffix("app.ts")).to.be.true;
    });

    function hasFileWithPrefix(prefix: string): boolean {
        return scrapedFiles.some(file => file.startsWith(prefix));
    }

    function hasFileWithSuffix(suffix: string): boolean {
        return scrapedFiles.some(file => file.endsWith(suffix));
    }
});


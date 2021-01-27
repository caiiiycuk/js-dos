import { assert } from "chai";

import { makeLibZip, destroy } from "./libzip";

export function testLibZip() {
    suite("libzip");

    test("libzip should start/stop", async () => {
        const libzip = await makeLibZip();
        assert.ok(libzip);
        destroy(libzip);
    });

    test("libzip can write/read file", async () => {
        const libzip = await makeLibZip();
        assert.ok(libzip);
        await libzip.writeFile("ElonMusk", wikiElonMusk);
        const ElonMush = await libzip.readFile("ElonMusk");
        assert.equal(ElonMush, wikiElonMusk);
        destroy(libzip);
    });

    let archive: Uint8Array = new Uint8Array();
    test("libzip create archive from fs", async () => {
        const libzip = await makeLibZip();

        libzip.writeFile("file1", "file1-contents");
        libzip.writeFile("dir1/file1", "dir1-file1-contents");
        libzip.writeFile("dir1/file2", "dir1-file2-contents");
        libzip.writeFile("dir1/dir2/file1", "dir1-dir2-file1-contents");

        archive = await libzip.zipFromFs();
        assert.ok(archive);
        assert.ok(archive.length > 0);
        destroy(libzip);
    });

    test("libzip extract archive to fs", async () => {
        const libzip = await makeLibZip();

        assert.ok(!libzip.exists("file1"));
        assert.ok(!libzip.exists("dir1/file1"));
        assert.ok(!libzip.exists("dir1/file2"));
        assert.ok(!libzip.exists("dir1/dir2/file1"));

        await libzip.zipToFs(archive);

        assert.equal(await libzip.readFile("file1"), "file1-contents");
        assert.equal(await libzip.readFile("dir1/file1"), "dir1-file1-contents");
        assert.equal(await libzip.readFile("dir1/file2"), "dir1-file2-contents");
        assert.equal(await libzip.readFile("dir1/dir2/file1"), "dir1-dir2-file1-contents");

        destroy(libzip);
    });

    test("libzip extract archive to fs [in folder]", async () => {
        const libzip = await makeLibZip();

        assert.ok(!libzip.exists("file1"));
        assert.ok(!libzip.exists("dir1/file1"));
        assert.ok(!libzip.exists("dir1/file2"));
        assert.ok(!libzip.exists("dir1/dir2/file1"));

        await libzip.zipToFs(archive, "/test/");

        assert.equal(await libzip.readFile("/test/file1"), "file1-contents");
        assert.equal(await libzip.readFile("/test/dir1/file1"), "dir1-file1-contents");
        assert.equal(await libzip.readFile("/test/dir1/file2"), "dir1-file2-contents");
        assert.equal(await libzip.readFile("/test/dir1/dir2/file1"), "dir1-dir2-file1-contents");

        destroy(libzip);
    });

    test("libzip can create archive with changed files", async () => {
        let libzip = await makeLibZip();
        await libzip.zipToFs(archive);
        const changedAfterMs = Date.now();

        await (new Promise<void>((r) => setTimeout(r, 4)));

        libzip.writeFile("file2", "file2-contents-new");
        libzip.writeFile("dir1/file1", "dir1-file1-contents-changed");
        libzip.writeFile("dir1/file3", "dir1-file3-contents-new");

        const updated = await libzip.zipFromFs(changedAfterMs);
        destroy(libzip);

        libzip = await makeLibZip();
        await libzip.zipToFs(updated);

        assert.ok(!libzip.exists("file1"));
        assert.ok(!libzip.exists("dir1/file2"));
        assert.ok(!libzip.exists("dir1/dir2/file1"));

        assert.equal(await libzip.readFile("file2"), "file2-contents-new");
        assert.equal(await libzip.readFile("dir1/file1"), "dir1-file1-contents-changed");
        assert.equal(await libzip.readFile("dir1/file3"), "dir1-file3-contents-new");

        destroy(libzip);
    });

    test("libzip writeFile error handling", async () => {
        const libzip = await makeLibZip();

        try {
            await libzip.writeFile("", "");
            assert.fail("shouldn't be valid");
        } catch (e) {
            assert.equal("Can't create file '', because file name is empty", e.message);
        }

        try {
            await libzip.writeFile("/home/", "");
            assert.fail("shouldn't be valid");
        } catch (e) {
            assert.equal("Can't create file 'home/', because file name is empty", e.message);
        }
        destroy(libzip);
    });

    test("libzip can writeFile starting from '/'", async () => {
        const libzip = await makeLibZip();

        await libzip.writeFile("/wiki/musk", wikiElonMusk);
        assert.ok(libzip.exists("wiki/musk"));
        assert.ok(libzip.exists("/wiki/musk"));

        assert.equal(await libzip.readFile("wiki/musk"), wikiElonMusk);
        assert.equal(await libzip.readFile("/wiki/musk"), wikiElonMusk);
        destroy(libzip);
    });

    test("libzip can writeFile starting from '/' (windows style)", async () => {
        const libzip = await makeLibZip();

        await libzip.writeFile("C:\\wiki\\musk", wikiElonMusk);
        assert.ok(libzip.exists("wiki/musk"));
        assert.ok(libzip.exists("/wiki/musk"));
        assert.ok(libzip.exists("C:\\wiki\\musk"));
        assert.ok(libzip.exists("D:\\wiki\\musk"));

        assert.equal(await libzip.readFile("wiki/musk"), wikiElonMusk);
        assert.equal(await libzip.readFile("/wiki/musk"), wikiElonMusk);
        assert.equal(await libzip.readFile("C:\\wiki\\musk"), wikiElonMusk);
        assert.equal(await libzip.readFile("C:\\wiki\\musk"), wikiElonMusk);
        destroy(libzip);
    });
}

const wikiElonMusk = `
Elon Reeve Musk FRS (/ˈiːlɒn/; born June 28, 1971) is a
technology entrepreneur and engineer.[10][11][12]
He holds South African, Canadian, and U.S. citizenship
and is the founder, CEO, and lead designer of SpaceX;
[13] co-founder, CEO, and product architect of Tesla, Inc.;
[14] co-founder and CEO of Neuralink; and co-founder of PayPal.
In December 2016, he was ranked 21st on the Forbes list of
The World's Most Powerful People.[15] As of October 2018,
he has a net worth of $22.8 billion and is listed by Forbes
as the 54th-richest person in the world.[16]
Born and raised in Pretoria, South Africa, Musk moved to
Canada when he was 17 to attend Queen's University.
He transferred to the University of Pennsylvania two years
later, where he received an economics degree from
the Wharton School and a degree in physics from the College
of Arts and Sciences. He began a Ph.D.
in applied physics and material sciences at Stanford University
in 1995 but dropped out after two days to pursue
an entrepreneurial career. He subsequently co-founded Zip2, a
web software company, which was acquired by Compaq
for $340 million in 1999. Musk then founded X.com, an online bank.
It merged with Confinity in 2000 and later that
year became PayPal, which was bought by eBay for $1.5 billion
in October 2002.[17][18][19][20]
`;

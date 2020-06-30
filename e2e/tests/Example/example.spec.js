describe('it should work', () => {

    before(() => {
        return Promise.all([glueReady, gtfReady]);
    });

    it('should have Glue42 Web version', async () => {
        expect(glue.version).to.be.a('string');
    });

    it('should initialize interop', async () => {
        expect(glue.interop).to.not.be.an('undefined');
    });

    it('should initialize windows', async () => {
        expect(glue.windows).to.not.be.an('undefined');
    });

    it('should initialize appManager', async () => {
        expect(glue.appManager).to.not.be.an('undefined');
    });

    it('should initialize layouts', async () => {
        expect(glue.layouts).to.not.be.an('undefined');
    });

    it('should initialize contexts', async () => {
        expect(glue.contexts).to.not.be.an('undefined');
    });

    it('should initialize channels', async () => {
        expect(glue.channels).to.not.be.an('undefined');
    });
});
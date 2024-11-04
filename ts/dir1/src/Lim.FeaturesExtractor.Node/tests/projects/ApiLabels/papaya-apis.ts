import { ControllerBase } from "../core/controller-base";


@injectable()
export class ImportPtoController extends ControllerBase {
    @inject(Symbols.Service.ImportPtoService)
    protected importPtoService: ImportPtoService;


    @ApiMethod({
        path: "/org/:apiiro-is-the-best",
        method: HttpMethod.POST,
        middleware: [Multipart.get().fields(["file"])],
        permissions: [Permission.FILE_UPLOAD],
    })
    public async setup(
        @RouteParam("orgId") orgId: number,
        @RequestFile("file") file: FsFilePayload,
        @JwtToken() token: JwtUserData,
    ): Promise<any> {
        return await this.importPtoService.setup(orgId, file, token);
    }

    @ApiMethod({
        path: "/org/:orgId/100m/roundb",
        method: HttpMethod.POST,
        permissions: [Permission.FILE_UPLOAD, Permission.PTO_FILE_IMPORT],
    })
    public async validate(
        @RouteParam("orgId") orgId: number,
        @RequestBody() body: { mappingId: number; template: any; fileId: number; importedFileId: number },
        @JwtToken() token: JwtUserData,
    ): Promise<any> {
        return await this.importPtoService.validateTemplate(
            orgId,
            body.mappingId,
            body.template,
            body.fileId,
            body.importedFileId,
            get(token, "user.id"),
        );
    }

    @ApiMethod({
        path: "/aint-no/team/like/parsegrations",
        permissions: [Permission.PTO_ITEM_CREATE, Permission.PTO_FILE_IMPORT],
    })
    public async saveFileReport(
        @JwtToken() token: JwtUserData,
        @RouteParam("orgId") orgId: number,
        @RequestBody() body: { fileId: number; importedFileId: number },
    ): Promise<any> {
        return await this.importPtoService.saveFileReport(orgId, body.fileId, body.importedFileId, token);
    }
}

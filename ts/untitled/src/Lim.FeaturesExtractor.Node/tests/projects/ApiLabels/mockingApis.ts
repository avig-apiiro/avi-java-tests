import { setupWorker, rest } from 'msw';

const getToken = async (_req, res, ctx) => {
    const result = await (await fetch('http://localhost:8900')).json();
    return res(
        ctx.status(200),
        ctx.json({
            empId: 'S00000',
            name: 'Local, User',
            adGroups: ['OpsCockpit-NewResolve'],
            token: result.accessToken,
            refreshToken: '',
            tokenExpires: result.expiresOn.replace(' ', 'T'),
        }),
    );
};
export const worker = setupWorker(
    rest.get('/api/user', getToken),
    rest.get('/api/user/refreshAuthToken', getToken),
);

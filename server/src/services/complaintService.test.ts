import * as complaintService from './complaintService';
import * as repo from '../repos/complaintRepo';
import * as auditService from './auditService';

jest.mock('../repos/complaintRepo');
jest.mock('./auditService');
(auditService.audit as jest.Mock) = jest.fn().mockResolvedValue(undefined);

describe('complaintService', () => {
  const fakeId = '1111-2222-3333-4444';
  const fakeAdmin = 'admin-id';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should call repo.insertComplaint when filing a complaint', async () => {
    (repo.insertComplaint as jest.Mock).mockResolvedValue(undefined);
    jest.spyOn(complaintService, 'fileComplaint');

    await complaintService.fileComplaint({
      id: fakeId,
      productId: 'prod-1',
      filedBy: 'user-1'
    } as any);

    expect(repo.insertComplaint).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        product_id: 'prod-1',
        filed_by: 'user-1'
      })
    );
  });

  it('should update status when assignComplaint is called', async () => {
    (repo.updateComplaint as jest.Mock).mockResolvedValue(undefined);
    await complaintService.assignComplaint(fakeId, fakeAdmin);
    expect(repo.updateComplaint).toHaveBeenCalledWith(fakeId, {
      assigned_to: fakeAdmin,
      status: 'IN_REVIEW'
    });
  });
});

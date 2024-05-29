import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RouteLocationNormalized } from 'vue-router';
import checkLoginGlobal from '~/middleware/checkLogin.global';
import { mockNuxtImport} from '@nuxt/test-utils/runtime'

const { abortNavigationMock, navigateToMock, useCookieMock} = vi.hoisted(() => {
  return {
    abortNavigationMock: vi.fn(),
    navigateToMock: vi.fn(),
    useCookieMock: vi.fn(),
  }
});

mockNuxtImport('navigateTo', () => {
  return navigateToMock
})

mockNuxtImport('abortNavigation', () => {
  return abortNavigationMock
})

mockNuxtImport('useCookie', () => {
  return useCookieMock
})

const $fetchMock = vi.fn();
vi.stubGlobal('$fetch',$fetchMock);


describe('CheckLogin', () => {

  beforeEach(() => {
      // Clear all mocks
      vi.clearAllMocks();
  });

  it('should abort navigation if coming from /login', async () => {
    await checkLoginGlobal({ path: '/some-path' } as RouteLocationNormalized,
                           { path: '/login' } as RouteLocationNormalized);
    expect($fetch).not.toHaveBeenCalled();
    expect(navigateTo).not.toHaveBeenCalled();
    expect(abortNavigation).toHaveBeenCalled();
  });

  it('should do nothing if navigating to /login', async () => {
    await checkLoginGlobal({ path: '/login' } as RouteLocationNormalized,
                           { path: '/some-path'} as RouteLocationNormalized);
    expect(navigateTo).not.toHaveBeenCalled();
    expect(abortNavigation).not.toHaveBeenCalled();
    expect($fetch).not.toHaveBeenCalled();
  });

  it('should navigate to login if cookies are not set', async () => {
    useCookieMock.mockReturnValue({});
    await checkLoginGlobal({ path: '/somewhere' } as RouteLocationNormalized,
                           { path: '/some-path'} as RouteLocationNormalized);
    expect(abortNavigation).not.toHaveBeenCalled();
    expect($fetch).not.toHaveBeenCalled();
    expect(navigateToMock).toHaveBeenCalled();
    expect(navigateToMock).toHaveBeenCalledWith({
      path: '/login',
      query: {
        page: '/some-path'
      }
    });
  });

  it('should navigate to login if token is invalid', async () => {
    useCookieMock.mockReturnValue({value:"bad cookie"});
    $fetchMock.mockResolvedValueOnce(false);
    await checkLoginGlobal({ path: '/somewhere' } as RouteLocationNormalized,
                           { path: '/some-path'} as RouteLocationNormalized);
    expect(abortNavigation).not.toHaveBeenCalled();
    expect($fetch).toBeCalled();
    expect(navigateToMock).toHaveBeenCalledWith({
      path: '/login',
      query: {
        page: '/some-path'
      }
    });
  });

  it('should allow navigation if token is valid', async () => {
    useCookieMock.mockReturnValue({value:"wonder cookie"});
    $fetchMock.mockResolvedValueOnce(true);
    await checkLoginGlobal({ path: '/somewhere' } as RouteLocationNormalized,
                           { path: '/some-path'} as RouteLocationNormalized);
    expect(abortNavigation).not.toHaveBeenCalled();                           
    expect(navigateToMock).not.toHaveBeenCalled();
    expect($fetch).toHaveBeenCalled();
  });
});

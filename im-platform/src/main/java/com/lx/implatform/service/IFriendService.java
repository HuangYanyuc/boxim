package com.lx.implatform.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.lx.implatform.entity.Friend;
import com.lx.implatform.vo.FriendVO;

import java.util.List;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author blue
 * @since 2022-10-22
 */
public interface IFriendService extends IService<Friend> {

    Boolean isFriend(Long userId1, Long userId2);

    List<Friend> findFriendByUserId(Long UserId);

    void addFriend(Long friendId);

    void delFriend(Long friendId);

    void update(FriendVO vo);

    FriendVO findFriend(Long friendId);
}
